import { createNewMonitor, getMonitors } from "../services/monitor.service.js"

export const createMonitorController = async(req,res) => {
    const monitor = await createNewMonitor(req.body);
    
    res.status(201).json({message: `Monitor created for url ${monitor.url}`});
}

export const getMonitorsController = async(req,res) => {
    const monitors = await getMonitors();

    res.status(200).json({monitors: monitors});
}