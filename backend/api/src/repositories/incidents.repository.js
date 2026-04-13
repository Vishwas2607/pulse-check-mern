import { Incident } from "../models/incidents.model.js"

export const getIncidentCursorBased = (query,limit) => {
    return Incident.find(query)
    .sort({startedAt: -1, _id:-1}).limit(limit).lean()
};

export const getCurrentIncidentFromDB = (monitorId) => {
    return Incident.find({monitorId}).sort({startedAt: -1}).limit(1).lean();
};

export const getRecentIncidentsBulk = (monitorIds) => {
    const pipeline = [
        {
            $match: {
                monitorId: {$in: monitorIds}
            }
        },

        {$sort: {startedAt: -1}},

        {
            $group: {
                _id: "$monitorId",
                latestEntry: {$first: "$$ROOT"}
            }
        },

        {$replaceRoot: {newRoot: "$latestEntry"}},

        {$project: {
            _id:0,
            monitorId:1,
            status:1,
            startedAt: 1,
            resolvedAt:1
        }}
    ]
    return Incident.aggregate(pipeline);
}

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
                durationInMs: {$max: [0,{$subtract:[rangeEnd, {$max: ["$startedAt", rangeStart]}]}]}
            }
        },
    
        {

            $group: {
                _id: "$monitorId",
                openDownTime: {$sum: "$durationInMs"}
            }
        }
        
    ]

    return Incident.aggregate(pipeline);
};

export const deleteIncidentsByMonitor = (monitorId) => {
    return Incident.findByIdAndDelete(monitorId);
}