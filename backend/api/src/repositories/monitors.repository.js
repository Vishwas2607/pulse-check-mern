import Monitor from "../models/monitors.model.js"

export const createMonitor = (data) => {
    return Monitor.create(data)
}

export const getMonitorsFromDB = () => {
    return Monitor.find({});
}
