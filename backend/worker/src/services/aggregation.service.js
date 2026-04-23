import { upsertHourlyAggregation } from "../../../api/src/repositories/hourlyAggregate.repository.js";
import { floorToHour } from "../utils/helpers.js";
import logger from "../utils/logger.js";

export const updateAggregation = async({monitorId, status, latency, created}) => {
    if(!created) return;

    const bucketStart = floorToHour(new Date());

    const incValues = {
        totalChecks: 1,
        upChecks: status === "up" ? 1: 0,
        totalResponseTime: status === "up" ? latency : 0
    };

    await upsertHourlyAggregation({monitorId,bucketStart}, incValues);
    logger.info({ monitorId, bucketStart, incValues },"Hourly aggregate updated");
};

