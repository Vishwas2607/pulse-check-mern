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