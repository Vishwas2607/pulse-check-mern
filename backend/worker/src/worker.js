import dotenv from "dotenv";
import { Worker } from "bullmq";
import { connection } from "./config/redis.js";
import { Heartbeat } from "../../api/src/models/heartbeats.model.js";
import ConnectDB from "../../api/src/config/db.connection.js";
import { Incident } from "../../api/src/models/incidents.model.js";
import { HourlyAggregate } from "../../api/src/models/hourlyAggregate.model.js";
import logger from "./utils/logger.js";
import Monitor from "../../api/src/models/monitors.model.js";

dotenv.config({ path: '../../.env' }); 

const getLastHeartbeats = async (monitorId) => {
    const heartbeats = await Heartbeat.find({monitorId}).sort({checkedAt: -1}).limit(3);
    return heartbeats;
}

const areLast3Down = (arr) => {
    if (arr.length === 3) {
        return arr.every(hb => hb.status === "down")
    }
    return false;
}

const getMonitorFromDB = async(monitorId) => {
    return await Monitor.findById(monitorId);
}

const createIncident = async(data) => {
    const newIncident = await Incident.create(data);
    return newIncident;
};

const updateIncident = async(monitorId) => {
    const updated = await Incident.findOneAndUpdate({monitorId, status:"open"}, {status:"resolved", resolvedAt: new Date()}, {runValidators:true, returnDocument:"before"})
    return updated;
}

const upsertHourlyAggregation = async(searchAndSetValue, incValues) => {
    const updated = await HourlyAggregate.updateOne(searchAndSetValue,{$setOnInsert: searchAndSetValue, $inc:incValues},{upsert:true})
    return updated;
}

const incrementFailureCount = async(search) => {
    await HourlyAggregate.updateOne(search, {$inc: {failureCount:1}},{upsert:true});
    return 
}

const floorToHour = (date) => {
    const d = new Date(date);
    d.setMinutes(0,0,0)
    return d; 
}

const updateBulkBucketDownTime = async(bulkOps) => {
    await HourlyAggregate.bulkWrite(bulkOps);
    return
}

class RetriableError extends Error {
    constructor(message) {
        super(message);
        this.name = "RetriableError";
    }
}

ConnectDB()
.then(()=> {
    logger.info("✅ Worker connected to DB");
    const worker = new Worker(
    "monitor-queue",
    async(job) => {
        const {url,monitorId} = job.data;

        logger.info(`Job received`, { jobId: job.id, monitorId, url });

        const monitor = await getMonitorFromDB(monitorId)
        if(!monitor) return;
        
        const start = Date.now();
        const now = new Date();
        const bucketStart = floorToHour(now)
        let newHeartbeat = true;

        const heartbeatData = {monitorId: monitorId, status: "up", checkedAt: new Date(),checkKey:job.id}
        let latency = 0;
        try{
            const res = await fetch(url,{ signal: AbortSignal.timeout(5000) });
            latency = Date.now() - start;
            heartbeatData.responseTime = latency;
            heartbeatData.statusCode = res.status;

            if (!res.ok) {
                if (res.status >= 500) {
                    logger.info(`Server Error ${res.status}: Triggering BullMQ retry...`);
                     throw new RetriableError(`Server Error: ${res.status}`);
                }
                heartbeatData.status = "down";
                heartbeatData.error = `HTTP Error: ${res.status}`;
            }

            logger.info('Monitor response', { monitorId, status: heartbeatData.status, httpCode: res.status, latency });

        }catch (err) {
            if (err.name === "AbortError" || err instanceof RetriableError){
                logger.warn(`Transient error - retrying`, { monitorId, error: err.message });
                throw err;
            };

            heartbeatData.status = "down";
            heartbeatData.error = err.message;
           logger.error(`Monitor marked down`, { monitorId, error: err.message });
        }

        try{
            const beat = await Heartbeat.create(heartbeatData);
            logger.info("Heartbeat created", { monitorId, status: beat.status, jobId: job.id });
        } catch (err) {
            if(err.code === 11000) {
                newHeartbeat = false;
                logger.warn("Duplicate heartbeat prevented", { monitorId, jobId: job.id });
            } else if (err.name === "ValidationError") {
                logger.error("Mongoose Validation Error:", err.message)
            } else {
                logger.error("Heartbeat Database Error:", err.message);
                throw err;
            }
        }

        const searchAndSetValue = {monitorId, bucketStart};
        const incValues = {totalChecks: 1, upChecks: heartbeatData.status === "up" ? 1: 0, totalResponseTime: heartbeatData.status === "up" ? latency : 0};
        
        if(newHeartbeat) {
            const updateHourlyAggregate = await upsertHourlyAggregation(searchAndSetValue,incValues)
            logger.info("Hourly aggregate updated", { monitorId, bucketStart, incValues });
        }

        const savedHeartBeats = await getLastHeartbeats(monitorId);

        if(areLast3Down(savedHeartBeats)) {
            logger.warn("Monitor down", { monitorId });
            try {
                const incidentData = {monitorId:monitorId, status:"open", startedAt:new Date(), resolvedAt: null}
                const createdIncident = await createIncident(incidentData);
                const bucketStart = floorToHour(createdIncident.startedAt);

                await incrementFailureCount({ monitorId, bucketStart });
                logger.info("New incident created", { monitorId, startedAt: createdIncident.startedAt });
            } catch (err) {
                if(err.code === 11000) logger.warn("Duplicate incident prevented", {monitorId})
                else if (err.name === "ValidationError") {
                    logger.error("Incident Validation Error:", {monitorId, error: err.message})
                } else {
                    logger.error("Incident DB error", { monitorId, error: err.message });
                    throw err;
                }
            } 
        } else {
            if(heartbeatData.status === "up") {
                const resolvedIncident = await updateIncident(monitorId);

                if (resolvedIncident) {

                let current = resolvedIncident.startedAt;
                if (!current) return;
                let resolvedAt = new Date();

                const bulkOps = [];
                while (current < resolvedAt) {
                let bucketStart = floorToHour(current);
                let bucketEnd = new Date(bucketStart.getTime() + 60 * 60 * 1000);

                let overlapEnd = new Date(Math.min(bucketEnd.getTime(), resolvedAt.getTime()));

                let duration = (overlapEnd - current)/1000;
                bulkOps.push({
                    updateOne: {
                        filter: {monitorId,bucketStart},
                        update:{$inc:{downtime: duration}},
                        upsert: true
                    }
                });

                current = overlapEnd;
                }

                if (bulkOps.length > 0) await updateBulkBucketDownTime(bulkOps);
                logger.info("Incident resolved & downtime recorded", { monitorId, buckets: bulkOps.length });
               
            } else {
                logger.info("Monitor OK, no open incident", { monitorId });
            }} else {
                logger.info("Monitor OK", { monitorId });
            }
        } 

    },
    {connection,
        concurrency: 5
    }
);

worker.on('ready', () => {
  logger.info('✅ Worker is connected and ready to receive jobs!');
});

worker.on("completed", (job)=> {
    logger.info(`Job ${job.id} completed`);
});

worker.on("failed", (job,err)=> {
    logger.info(`failed jobId: ${job.id}, monitorId: ${job.data.monitorId}, attempNumber: ${job.attemptsMade}`)
    logger.error("[Error]:", err.message)
})
}).catch((err)=> logger.error("Failed to connect to DB", err.message))