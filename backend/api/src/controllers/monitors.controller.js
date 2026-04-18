import { createNewMonitor, deleteMonitorService, getMonitors, getMonitorStatus, getSummary, updateMonitorService } from "../services/monitors.service.js"

export const createMonitorController = async(req,res) => {
    const monitor = await createNewMonitor(req.user, req.validatedBody);
    
    res.status(201).json({message: `Monitor created for url ${monitor.url}`});
}

export const getMonitorsController = async(req,res) => {
    const monitors = await getMonitors(req.user);

    res.status(200).json({monitors: monitors});
}

export const getMonitorStatusController = async(req,res) => {
    const monitorStatus = await getMonitorStatus(req.monitor,req.user);

    return res.status(200).json(monitorStatus)
}

export const getSummaryController = async(req,res) => {
    const summary = await getSummary(req.monitor,req.validatedQuery.range)

    return res.status(200).json(summary);
}

export const updateMonitorController = async(req,res) => {
    const updatedMonitor = await updateMonitorService(req.monitor,req.body); 

    return res.status(200).json({message: "Successfully updated monitor", data:{updatedMonitor:updatedMonitor}})
}

export const deleteMonitorController = async(req,res) => {
    const deletedMonitor = await deleteMonitorService(req.monitor);

    return res.status(200).json({message:"Successfully deleted monitor", data: {deletedMonitor:deletedMonitor}})
}