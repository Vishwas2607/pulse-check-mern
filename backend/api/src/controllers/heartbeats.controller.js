import { getHeartbeats } from "../services/heartbeats.service.js"

export const getHeartbeatsController = async(req,res) => {
    const heartbeats = await getHeartbeats(req.monitor, req.query);

    return res.status(200).json({heartbeats: heartbeats});
}