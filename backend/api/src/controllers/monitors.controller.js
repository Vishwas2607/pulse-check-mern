import { createNewMonitor, getMonitors, getMonitorStatus, getSummary } from "../services/monitors.service.js"

export const createMonitorController = async(req,res) => {
    const monitor = await createNewMonitor(req.user, req.body);
    
    res.status(201).json({message: `Monitor created for url ${monitor.url}`});
}

export const getMonitorsController = async(req,res) => {
    const monitors = await getMonitors(req.user);

    res.status(200).json({monitors: monitors});
}

export const getMonitorStatusController = async(req,res) => {
    const monitorStatus = await getMonitorStatus(req.user,req.params.id)

    res.status(200).json({monitorStatus: monitorStatus});
}

export const getSummaryController = async(req,res) => {
    const summary = await getSummary(req.user,req.params.id,req.query.range="24h")

    return res.status(200).json(summary);
}