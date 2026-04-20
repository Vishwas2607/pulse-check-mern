import { Heartbeat } from "../models/heartbeats.model.js"

export const getHeartbeatsFromDB = (monitorId,skip,limit) => {
    return Heartbeat.find({monitorId}).sort({checkedAt: -1}).skip(skip).limit(limit)
}

export const getHeartbeatCursorBased = (query,limit) => {
    return Heartbeat.find(query).sort({checkedAt:-1, _id:-1}).limit(limit).lean()
}
export const getLastHeartbeatFromDB = (monitorId) => {
    return Heartbeat.find({monitorId}).sort({checkedAt:-1}).limit(1).lean();
}

export const getHeartbeatSummary = async (monitorId, range) => {
    const pipeline = ([
        {$match: {monitorId: monitorId, checkedAt: {$gte: range}}},

        {
            $group: {
                _id: "$monitorId",
                totalCount: {$sum:1},
                uptimeCount: {
                    $sum: {$cond: [{$eq: ["$status", "up"]},1,0]}
                },
                avgResponseTime:{
                    $avg: {$cond: [{$eq: ["$status", "up"]}, "$responseTime", "$$REMOVE"]}
                }
            }
        }
    ])

    return Heartbeat.aggregate(pipeline);
}

export const deleteHeartbeatsByMonitor = (monitorId) => {
    return Heartbeat.findByIdAndDelete(monitorId);
}