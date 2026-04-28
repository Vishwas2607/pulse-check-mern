import { floorToHour } from "./helpers.js";

export const calculateDowntimeBuckets = (start, end, monitorId) => {

    let currentTs = start instanceof Date ? start.getTime() : start;
    const endTs = end instanceof Date ? end.getTime() : end;
    
    const ops = [];

    while (currentTs < endTs) {
        const bucketStart = floorToHour(currentTs);
        const bucketEndTs = bucketStart.getTime() + 60 * 60 * 1000;
        console.log({bucketStart})
        const overlapEndTs = Math.min(bucketEndTs, endTs);

        const duration = (overlapEndTs - currentTs) / 1000;

        if (duration > 0) {
            ops.push({
                updateOne: {
                    filter: { monitorId, bucketStart },
                    update: { $inc: { downtime: duration } },
                    upsert: true
                }
            });
        }

        currentTs = overlapEndTs;
    }
    return ops;
};
