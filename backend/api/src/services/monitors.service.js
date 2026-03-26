import { monitorQueue } from "../queues/monitor.queue.js";
import { getHeartbeatSummary } from "../repositories/heartbeats.repository.js";
import { getCurrentIncidentFromDB, getIncidentSummary } from "../repositories/incidents.repository.js";
import { createMonitor, getMonitorsFromDB } from "../repositories/monitors.repository.js"
import AppError from "../utils/appError.js"

export const createNewMonitor = async (data) => {

    if(!data || !data.url || !data.interval) throw new AppError(400, "Either fields are empty or no data provided");
    const monitor = await createMonitor(data);

    await monitorQueue.add(`monitor-check-${monitor._id}`, 
    {
        monitorId: monitor._id,
        url : monitor.url,

    },
    {
        repeat: {
            every: monitor.interval * 1000,
        },
        jobId: monitor._id.toString()
    }
)
    console.log(monitor);
    return monitor
}

export const getMonitors = async() => {
    const monitors = await getMonitorsFromDB();

    if(!monitors || monitors.length === 0) throw new AppError(404, "No monitors found");

    return monitors;
};

export const getMonitorStatus = async(id) => {
    const status = await getCurrentIncidentFromDB(id);
    if(!status) return {status:"UNKNOWN"}
    else if(status.status=== "resolved") return {...status, status: "Up"}
    return {...status, status:"DOWN"}
}

const convertToDate = (range) => {
    const match = range.match(/^(\d+)([dhm])$/);
    if (!match) throw new Error("Invalid range format");

    const [, value, unit] = match;
    const duration = parseInt(value, 10);

    const date = new Date();

    if (unit === "d") date.setDate(date.getDate() - duration);
    if (unit === "h") date.setHours(date.getHours() - duration);
    if (unit === "m") date.setMinutes(date.getMinutes() - duration);

    return date;
};

export const getSummary = async(id,range) => {

    const rangeStart = convertToDate(range);
    const rangeEnd = new Date();
    const [heartbeatSummary = {}] = await getHeartbeatSummary(id,rangeStart);
    const [incidentSummary ={}] = await getIncidentSummary(id,rangeStart,rangeEnd);

    const downTime = incidentSummary.totalDownTime;

    const totalDownTime = Math.floor(downTime/1000);


    const summary = {
        uptimePercentage: heartbeatSummary.totalCount ? (heartbeatSummary.uptimeCount/heartbeatSummary.totalCount)*100 : null,
        avgResponseTime: heartbeatSummary.avgResponseTime || 0,
        totalDownTime: totalDownTime,
        failureCount: incidentSummary.count || 0,
    }

    return summary;
}