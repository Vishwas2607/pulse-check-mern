import Monitor from "../models/monitors.model.js"

export const createMonitor = (data) => {
    return Monitor.create(data)
}

export const getMonitorByMonitorId = async(monitorId) => {
    return await Monitor.findById(monitorId);
}

export const getMonitorsFromDB = (userId) => {
    return Monitor.find({userId}).lean();
}

export const getOneMonitorFromDB = (userId,monitorId) => {
    return Monitor.findOne({_id:monitorId, userId});
}

export const updateMonitor = (monitorId,data) => {
    return Monitor.findByIdAndUpdate(monitorId, data)
}

export const deleteMonitor = (monitorId) => {
    return Monitor.findByIdAndDelete(monitorId);
}