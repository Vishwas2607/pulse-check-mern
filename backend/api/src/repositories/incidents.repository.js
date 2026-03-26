import { Incident } from "../models/incidents.model.js"

export const getIncidentsFromDB = (monitorId, skip,limit) => {
    return Incident.find({monitorId}).sort({startedAt: -1}).skip(skip).limit(limit)
}

export const getCurrentIncidentFromDB = (monitorId) => {
    return Incident.find({monitorId}).sort({startedAt: -1}).limit(1);
};

export const getIncidentSummary = (monitorId,rangeStart,rangeEnd)=> {

    const pipeline = [
            {
                $match: {
                    monitorId: monitorId,
                    startedAt: { $lte: rangeEnd },
                    $or: [
                        { resolvedAt: { $gte: rangeStart } },
                        { resolvedAt: null }
                    ]
                }
            },
            {
                $addFields: {
                    actualStart: { $max: ["$startedAt", rangeStart] },
                    actualEnd: { $min: [{ $ifNull: ["$resolvedAt", rangeEnd] }, rangeEnd] }
                }
            },
            {
                $addFields: {
                    durationInMs: {$max: [{ $subtract: ["$actualEnd", "$actualStart"] },0]}
                }
            },
            {
                $group: {
                    _id: "$monitorId",
                    count: { $sum: 1 },
                    totalDownTime: { $sum: "$durationInMs" }
                }
            }
        ];

    return Incident.aggregate(pipeline);
}