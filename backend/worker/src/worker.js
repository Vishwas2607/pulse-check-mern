import dotenv from "dotenv";
import { Worker } from "bullmq";
import { connection } from "./config/redis.js";
import { Heartbeat } from "../../api/src/models/heartbeats.model.js";
import ConnectDB from "../../api/src/config/db.connection.js";
import { Incident } from "../../api/src/models/incidents.model.js";

dotenv.config({ path: '../../.env' }); 

const getLastHeartbeats = async (monitorId) => {
    const heartbeats = await Heartbeat.find({monitorId}).sort({checkedAt: -1}).limit(3);
    return heartbeats;
}

const areLast3Down = (arr) => {
    if (arr.length === 3) {
        return arr.every(hb => hb.status === "down")
    }
    return false;
}

const incidentCheck = async (monitorId) => {
    const incident = await Incident.findOne({monitorId, status: "open"});

    return !!incident;
}

const createIncident = async(data) => {
    const newIncident = await Incident.create(data);
    return newIncident;
};

const updateIncident = async(monitorId) => {
    const updated = await Incident.findOneAndUpdate({monitorId, status:"open"}, {status:"resolved", resolvedAt: new Date()}, {runValidators:true, returnDocument:"after"})
    return updated;
}

ConnectDB()
.then(()=> {
    console.log("Worker Connected to DB")
    const worker = new Worker(
    "monitor-queue",
    async(job) => {
        console.log("Job Received:", job.name);
        console.log("Data:", job.data);

        const {url} = job.data;
        const {monitorId} = job.data;

        const start = Date.now();
        const heartbeatData = {monitorId: monitorId, status: "up", checkedAt: new Date()}
        try{
            const res = await fetch(url);
            const latency = Date.now() - start;

            heartbeatData.responseTime = latency;
            heartbeatData.statusCode = res.status;

            if (!res.ok) {
                heartbeatData.status = "down";
                heartbeatData.error = `HTTP Error: ${res.status}`;
            }

            console.log(`Monitor ${monitorId} - Status: ${res.status} (${heartbeatData.status})`);

        }catch (err) {
            heartbeatData.status = "down";
            heartbeatData.error = err.message
            console.log("Request failed:", err.message)
        }

        const beat = await Heartbeat.create(heartbeatData);
        console.log(beat);

        const savedHeartBeats = await getLastHeartbeats(monitorId);
        const checkIncident = await incidentCheck(monitorId);
        if(areLast3Down(savedHeartBeats)) {
            console.log("Monitor:",monitorId, "Down ❌");
            if (!checkIncident) {
                const incidentData = {monitorId:monitorId, status:"open", startedAt:new Date(), resolvedAt: null}
                const incident = await createIncident(incidentData);
                console.log("New Incident Created", incident);
            } else {
                console.log("No new Incident Created")
            }

        } else {
            if(heartbeatData.status === "up" && checkIncident) {
                await updateIncident(monitorId);
                console.log("Incident Resolved")
            } else {
                console.log("Monitor:",monitorId, "Okay ✅");
            }
        };

    },
    {connection,
        concurrency: 5
    }
);

worker.on('ready', () => {
  console.log('✅ Worker is connected and ready to receive jobs!');
});

worker.on("completed", (job)=> {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job,err)=> {
    console.log(`Job ${job.id} failed:`, err.message)
})
}).catch((err)=> console.error("Failed to connect to DB", err.message))