import { Incident } from "../models/incidents.model.js"

export const getIncidentsFromDB = (monitorId, skip,limit) => {
    return Incident.find({monitorId}).sort({startedAt: -1}).skip(skip).limit(limit)
}

export const getCurrentIncidentFromDB = (monitorId) => {
    return Incident.find({monitorId}).sort({startedAt: -1}).limit(1);
};

export const getOpenIncidents = (monitorId,rangeStart,rangeEnd) => {
    const pipeline = [
        {
            $match: {
                monitorId: monitorId,
                status: "open",
                startedAt: {$lte: rangeEnd} 
            },
        },
        {
            $addFields: {
                actualStart: { $max: ["$startedAt", rangeStart] },
                actualEnd: rangeEnd
            }
        },

        {
            $addFields: {
                durationInMs: {$max: [{$subtract: [{actualStart: { $max: ["$startedAt", rangeStart] }},{actualEnd: rangeEnd }]},0]}
            }
        },
    
        {

            $group: {
                _id: "$monitorId",
                count: {$sum:1},
                openDowntime: {$sum: "$durationInMs"}
            }
        }
        
    ]

    return Incident.aggregate(pipeline);
};

export const getResolvedIncident = (monitorId,rangeStart,rangeEnd) => {
    const pipeline = [
        {
            $match: {
                monitorId: monitorId,
                status: "resolved",
                resolvedAt: {$gte: rangeStart},
                startedAt: {$lte: rangeEnd}
            },
        },

        {
            $addFields: {
                actualStart: { $max: ["$startedAt", rangeStart] },
                actualEnd: { $min: ["$resolvedAt", rangeEnd] }
            }
        },

        {
            $addFields: {
                durationInMs: {$max: [{$subtract: [{actualStart: { $max: ["$startedAt", rangeStart] }},{actualEnd: {$min: ["$resolvedAt", rangeEnd]}}]},0]}
            }
        },
    
        {

            $group: {
                _id: "$monitorId",
                count: {$sum:1},
                resolvedDowntime: {$sum: "$durationInMs"}
            }
        }
        
    ]

    return Incident.aggregate(pipeline);
};

export const getIncidentSummary = (monitorId,rangeStart,rangeEnd)=> {

    const pipeline = [
            {
                $match: {
                    monitorId: monitorId,
                    $or: [ {$and: [{status: {$eq: "open"}, startedAt: {$lte: rangeEnd}}]}, {$and: [{status: {$eq: "resolved"}}, {startedAt: {$lte: rangeEnd}}, {resolvedAt: {$gte: rangeStart}}]}]
                }
            },
            {
                $addFields: {
                    actualStart: { $max: ["$startedAt", rangeStart] },
                    actualEnd: { $min: [{ $ifNull: ["$resolvedAt", rangeEnd] }, rangeEnd]}
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
};