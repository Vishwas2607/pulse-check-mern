import { Incident } from "../models/incidents.model.js"

export const getIncidentCursorBased = (query,limit) => {
    return Incident.find(query)
    .sort({startedAt: -1, _id:-1}).limit(limit)
};

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