import { getHeartbeats } from "../services/heartbeats.service.js"

export const getHeartbeatsController = async(req,res) => {
    const heartbeats = await getHeartbeats(req.params.id, req.query);

    return res.status(200).json({heartbeats: heartbeats});
}