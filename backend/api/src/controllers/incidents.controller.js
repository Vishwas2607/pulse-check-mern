import { getIncidents } from "../services/incidents.service.js";

export const getIncidentController = async(req,res) => {
    const incidents = await getIncidents(req.params.id, req.query)

    return res.status(200).json({incidents: incidents});
}