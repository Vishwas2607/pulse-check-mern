import Monitor from "../models/monitors.model.js"

export const createMonitor = (data) => {
    return Monitor.create(data)
}

export const getMonitorsFromDB = (userId) => {
    return Monitor.find({userId});
}

export const getOneMonitorFromDB = (userId,monitorId) => {
    return Monitor.findOne({userId,monitorId});
}