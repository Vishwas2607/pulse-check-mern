import { HourlyAggregate } from "../models/hourlyAggregate.model.js"

export const getHourlyAggregate = (monitorId, rangeStart,rangeEnd) => {
    return HourlyAggregate.find({monitorId, bucketStart: {$gte: rangeStart, $lte:rangeEnd}})
}