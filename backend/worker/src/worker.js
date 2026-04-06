import dotenv from "dotenv";
import { Worker } from "bullmq";
import { connection } from "./config/redis.js";
import { Heartbeat } from "../../api/src/models/heartbeats.model.js";
import ConnectDB from "../../api/src/config/db.connection.js";
import { Incident } from "../../api/src/models/incidents.model.js";
import { HourlyAggregate } from "../../api/src/models/hourlyAggregate.model.js";

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

const incidentCheck = async (monitorId) => {
    const incident = await Incident.findOne({monitorId, status: "open"});

    return incident;
}

const createIncident = async(data) => {
    const newIncident = await Incident.create(data);
    return newIncident;
};

const updateIncident = async(monitorId) => {
    const updated = await Incident.findOneAndUpdate({monitorId, status:"open"}, {status:"resolved", resolvedAt: new Date()}, {runValidators:true, returnDocument:"after"})
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

ConnectDB()
.then(()=> {
    console.log("Worker Connected to DB")
    const worker = new Worker(
    "monitor-queue",
    async(job) => {
        console.log("Job Received:", job.name);
        console.log("Data:", job.data);

        const {url} = job.data;
        const {monitorId} = job.data;

        const start = Date.now();
        const now = new Date();
        const bucketStart = floorToHour(now);

        const heartbeatData = {monitorId: monitorId, status: "up", checkedAt: new Date(),checkKey:job.id}
        let latency = 0;
        try{
            const res = await fetch(url);
            latency = Date.now() - start;

            heartbeatData.responseTime = latency;
            heartbeatData.statusCode = res.status;

            if (!res.ok) {
                heartbeatData.status = "down";
                heartbeatData.error = `HTTP Error: ${res.status}`;
            }

            console.log(`Monitor ${monitorId} - Status: ${res.status} (${heartbeatData.status})`);

        }catch (err) {
            heartbeatData.status = "down";
            heartbeatData.error = err.message
            console.log("Request failed:", err.message)
        }

        try{
            const beat = await Heartbeat.create(heartbeatData);
            console.log(beat);
        } catch (err) {
            if(err.code === 11000) {
                console.log("Duplicate heartbeat prevented.")
            } else console.error(err);
        }
        
        const searchAndSetValue = {monitorId, bucketStart};
        const incValues = {totalChecks: 1, upChecks: heartbeatData.status === "up" ? 1: 0, totalResponseTime: heartbeatData.status === "up" ? latency : 0};
        
        const updateHourlyAggregate = await upsertHourlyAggregation(searchAndSetValue,incValues)

        console.log(updateHourlyAggregate);

        const savedHeartBeats = await getLastHeartbeats(monitorId);
        const incident = await incidentCheck(monitorId);

        if(areLast3Down(savedHeartBeats)) {
            console.log("Monitor:",monitorId, "Down ❌");
            try {
                const incidentData = {monitorId:monitorId, status:"open", startedAt:new Date(), resolvedAt: null}
                const createdIncident = await createIncident(incidentData);
                const bucketStart = floorToHour(createdIncident.startedAt);

                await incrementFailureCount({ monitorId, bucketStart });
                console.log("New Incident Created", createdIncident);
            } catch (err) {
                if(err.code === 11000) console.log("Duplicate incident prevented.")
                else console.error(err);
            } 
        } else {
            if(heartbeatData.status === "up" && incident) {
                let current = incident.startedAt;
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

                await updateIncident(monitorId);
                if (bulkOps.length > 0) await updateBulkBucketDownTime(bulkOps);
                console.log("Incident Resolved");

            } else {
                console.log("Monitor:",monitorId, "Okay ✅");
            }
        };

    },
    {connection,
        concurrency: 5
    }
);

worker.on('ready', () => {
  console.log('✅ Worker is connected and ready to receive jobs!');
});

worker.on("completed", (job)=> {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job,err)=> {
    console.log(`Job ${job.id} failed:`, err.message)
})
}).catch((err)=> console.error("Failed to connect to DB", err.message))