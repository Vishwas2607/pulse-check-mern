import mongoose from "mongoose"
import { HourlyAggregate } from "../models/hourlyAggregate.model.js"

export const getHourlyAggregate = (monitorId, rangeStart, rangeEnd, binSize = 1) => {

    const pipeline = [
        {
            $match: {
                monitorId: String(monitorId),
                bucketStart: { $gte: rangeStart, $lte: rangeEnd }
            }
        },
        {
            $group: {
                _id: {
                    $dateTrunc: {
                        date: "$bucketStart",
                        unit: "hour",
                        binSize: binSize,
                        timezone: "Asia/Kolkata"
                    }
                },
                totalChecks: { $sum: "$totalChecks" },
                upChecks: { $sum: "$upChecks" },
                totalResponseTime: { $sum: "$totalResponseTime" },
                downtime: { $sum: "$downtime" },
                failureCount: { $sum: "$failureCount" },
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ];

    return HourlyAggregate.aggregate(pipeline);
};
