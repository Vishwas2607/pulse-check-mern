import { incrementFailureCount, updateBulkBucketDownTime } from "../../../api/src/repositories/hourlyAggregate.repository.js";
import { createIncident, updateIncident } from "../../../api/src/repositories/incidents.repository.js";
import { calculateDowntimeBuckets } from "../utils/downtime.util.js";
import { areLast3Down, floorToHour } from "../utils/helpers.js"
import logger from "../utils/logger.js";

export const handleIncidentCreation = async (monitorId, heartbeats) => {
    if(!areLast3Down(heartbeats)) return;

    logger.warn({ monitorId },"Monitor down");
    try {
        const incident = await createIncident({
            monitorId: monitorId,
            status: "open",
            startedAt: new Date(),
            resolvedAt: null
        });

        logger.info({ monitorId, startedAt: incident.startedAt },"New incident created");

        const bucketStart = floorToHour(incident.startedAt);
        await incrementFailureCount({monitorId,bucketStart});

        return incident
    } catch (err) {
        if(err.code === 11000) {
            logger.warn({monitorId},"Duplicate incident prevented")
            return null
        } else if (err.name === "ValidationError") {
            logger.error({monitorId, error: err.message}, "Incident Validation Error:")
            return null
        } else {
            logger.error({ monitorId, error: err.message },"Incident DB error");
            throw err;
        }
    }
};

export const handleIncidentResolution = async (monitorId) => {
    const resolvedIncident = await updateIncident(monitorId);

    if(!resolvedIncident) {
        logger.info({ monitorId }, "Monitor OK, no open incident");
        return null;
    }

    const ops = calculateDowntimeBuckets(resolvedIncident.startedAt, new Date(), monitorId);

    if(ops.length > 0) {
        await updateBulkBucketDownTime(ops);
    };

    logger.info({ monitorId, buckets: ops.length }, "Incident resolved & downtime recorded");

    return resolvedIncident;
}