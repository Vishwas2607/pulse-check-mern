import { floorToHour } from "./helpers.js";

export const calculateDowntimeBuckets = (start,end,monitorId) => {
    let current = start;
    const ops = [];

    while (current < end) {
        const bucketStart = floorToHour(current);
        const bucketEnd = new Date(bucketStart.getTime() + 60*60*1000);

        const overlapEnd = new Date(Math.min(bucketEnd,end));
        const duration = (overlapEnd - current)/1000;

        ops.push({
            updateOne: {
                filter: {monitorId,bucketStart},
                update: {$inc: {downtime: duration}},
                upsert: true
            }
        });

        current = overlapEnd;
    }
    return ops;
}