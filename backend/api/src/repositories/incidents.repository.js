import { Incident } from "../models/incidents.model.js"

export const getIncidentsFromDB = (monitorId, skip,limit) => {
    return Incident.find({monitorId}).sort({startedAt: -1}).skip(skip).limit(limit)
}

export const getCurrentIncidentFromDB = (monitorId) => {
    return Incident.find({monitorId}).sort({startedAt: -1}).limit(1);
}