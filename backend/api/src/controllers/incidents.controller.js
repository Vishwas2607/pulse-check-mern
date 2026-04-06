import { Incident } from "../models/incidents.model.js";
import { getIncidents } from "../services/incidents.service.js";

export const getIncidentController = async(req,res) => {
    const incidents = await getIncidents(req.params.id, req.query)

    return res.status(200).json(incidents);
}


export const addIncidentSeed = async(req,res) => {
    const incidents = [];
    const now = Date.now();
    let monitorId = req.params.id;

    const deleteResult = await Incident.deleteMany({ monitorId });
    console.log(`Cleared ${deleteResult.deletedCount} existing records for monitor ${monitorId}.`);

    for (let i = 0; i < 10000; i++) {
    incidents.push({
        monitorId,
        startedAt: new Date(now - i * 60000),
        status: i%500 === 0 ? "open" : "resolved",
        ...(i%500 !== 0 ? {resolvedAt: new Date(now - i*30000)}: {})
    })};

    
    const result = await Incident.insertMany(incidents);
    console.log(`Successfully seeded ${result.length} documents.`);

    res.status(200).json({ 
            message: "Seed successful", 
            cleared: deleteResult.deletedCount,
            inserted: result.length 
        });
}