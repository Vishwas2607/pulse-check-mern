import logger from "./utils/logger.js";
import { RetriableError } from "./utils/retriableError.js";
import { areLast3Down, floorToHour } from "./utils/helpers.js";
import { createHeartbeat, getHeartbeatsFromDB } from "../../api/src/repositories/heartbeats.repository.js";
import { getMonitorByMonitorId } from "../../api/src/repositories/monitors.repository.js";
import { createIncident, updateIncident } from "../../api/src/repositories/incidents.repository.js";
import { upsertHourlyAggregation, incrementFailureCount, updateBulkBucketDownTime } from "../../api/src/repositories/hourlyAggregate.repository.js";

const monitorProcessor = async(job) => {
        const {url,monitorId} = job.data;

        logger.info(`Job received`, { jobId: job.id, monitorId, url });

        const monitor = await getMonitorByMonitorId(monitorId)
        if(!monitor) return;
        
        const start = performance.now();
        const now = new Date();
        const bucketStart = floorToHour(now)
        let newHeartbeat = true;

        const heartbeatData = {monitorId: monitorId, status: "up", checkedAt: new Date(),checkKey:job.id}
        let latency = 0;
        try{
            const res = await fetch(url,{ signal: AbortSignal.timeout(5000)});
            latency = performance.now() - start;
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

            logger.info({ monitorId, status: heartbeatData.status, httpCode: res.status, latency },'Monitor response');

        }catch (err) {
            if (err.name === "AbortError" || err instanceof RetriableError){
                logger.warn({ monitorId, error: err.message },`Transient error - retrying`);
                throw err;
            };

            heartbeatData.status = "down";
            heartbeatData.error = err.message;
           logger.error({ monitorId, error: err.message }, `Monitor marked down`);
        }

        try{
            const beat = await createHeartbeat(heartbeatData);
            logger.info({ monitorId, status: beat.status, jobId: job.id },"Heartbeat created");
        } catch (err) {
            if(err.code === 11000) {
                newHeartbeat = false;
                logger.warn({ monitorId, jobId: job.id },"Duplicate heartbeat prevented");
            } else if (err.name === "ValidationError") {
                logger.error(`Mongoose Validation Error: ${err.message}`)
            } else {
                logger.error(`Heartbeat Database Error: ${err.message}`);
                throw err;
            }
        }

        const searchAndSetValue = {monitorId, bucketStart};
        const incValues = {totalChecks: 1, upChecks: heartbeatData.status === "up" ? 1: 0, totalResponseTime: heartbeatData.status === "up" ? latency : 0};
        
        if(newHeartbeat) {
            const updateHourlyAggregate = await upsertHourlyAggregation(searchAndSetValue,incValues)
            logger.info({ monitorId, bucketStart, incValues },"Hourly aggregate updated");
        }

        const savedHeartBeats = await getHeartbeatsFromDB(monitorId,0,3);

        if(areLast3Down(savedHeartBeats)) {
            logger.warn({ monitorId },"Monitor down");
            try {
                const incidentData = {monitorId:monitorId, status:"open", startedAt:new Date(), resolvedAt: null}
                const createdIncident = await createIncident(incidentData);
                const bucketStart = floorToHour(createdIncident.startedAt);

                await incrementFailureCount({ monitorId, bucketStart });
                logger.info({ monitorId, startedAt: createdIncident.startedAt },"New incident created");
            } catch (err) {
                if(err.code === 11000) logger.warn({monitorId},"Duplicate incident prevented")
                else if (err.name === "ValidationError") {
                    logger.error({monitorId, error: err.message}, "Incident Validation Error:")
                } else {
                    logger.error({ monitorId, error: err.message },"Incident DB error");
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
                logger.info({ monitorId, buckets: bulkOps.length }, "Incident resolved & downtime recorded");
               
            } else {
                logger.info({ monitorId }, "Monitor OK, no open incident");
            }} else {
                logger.info({ monitorId },"Monitor OK");
            }
        } 

    }

export default monitorProcessor;