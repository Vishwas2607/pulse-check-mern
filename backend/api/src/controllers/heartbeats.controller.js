import { getHeartbeats, getLastHeartbeat } from "../services/heartbeats.service.js"

export const getHeartbeatsController = async(req,res) => {
    const heartbeats = await getHeartbeats(req.monitor, req.query);

    return res.status(200).json({heartbeats: heartbeats});
}

export const getLastHeartbeatController = async(req,res) => {
    const lastHeartbeat = await getLastHeartbeat(req.monitor);
    
    return res.status(200).json({lastHeartbeat: lastHeartbeat});
}