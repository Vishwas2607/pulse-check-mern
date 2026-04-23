import { createHeartbeat } from "../../../api/src/repositories/heartbeats.repository.js";
import { RetriableError } from "../utils/retriableError.js";
import logger from "../utils/logger.js";

export const processHeartbeat = async({url,monitorId, jobId}) => {
    const start = performance.now();

    const heartbeatData = {
        monitorId,
        status: "up",
        checkedAt: new Date(),
        checkKey: jobId
    };

    try {
        const res = await fetch(url, {signal: AbortSignal.timeout(5000)});
        const latency = performance.now() - start;

        heartbeatData.responseTime= latency;
        heartbeatData.statusCode = res.status;

        if(!res.ok) {
            if (res.status >= 500) {
                logger.info(`Server Error ${res.status}: Triggering BullMQ retry...`);
                throw new RetriableError(`Server Error: ${res.status}`);
            }
            heartbeatData.status = "down";
            heartbeatData.error = `HTTP Error: ${res.status}`;
        }

        logger.info({ monitorId, status: heartbeatData.status, httpCode: res.status, latency },'Monitor response');
        
    } catch (err) {
        if(err.name === "AbortError" || err instanceof RetriableError) {
            logger.warn({ monitorId, error: err.message },`Transient error - retrying`);
            throw err;
        }
        heartbeatData.status = "down";
        heartbeatData.error = err.message;
        logger.error({ monitorId, error: err.message }, `Monitor marked down`);
    }

    return heartbeatData;
}

export const saveHeartbeat = async(heartbeatData) => {
    try {
        const beat = await createHeartbeat(heartbeatData);
        logger.info({ monitorId:beat.monitorId, status: beat.status },"Heartbeat created");
        return {created: true, data:beat}
    } catch (err){
        if(err.code === 11000){
            logger.warn({ monitorId: heartbeatData.monitorId},"Duplicate heartbeat prevented");
            return {created: false};
        }else if (err.name === "ValidationError") {
            logger.error(`Mongoose Validation Error: ${err.message}`)
            return {created: false};
        } else {
            logger.error(`Heartbeat Database Error: ${err.message}`);
            throw err;
        }
    }
}