import { Heartbeat } from "../models/heartbeats.model.js"

export const getHeartbeatsFromDB = (monitorId,skip,limit) => {
    return Heartbeat.find({monitorId}).sort({checkedAt: -1}).skip(skip).limit(limit)
}