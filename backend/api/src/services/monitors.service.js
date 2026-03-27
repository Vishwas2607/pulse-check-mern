import { monitorQueue } from "../queues/monitor.queue.js";
import { getHeartbeatSummary } from "../repositories/heartbeats.repository.js";
import { getCurrentIncidentFromDB, getOpenIncidents, getResolvedIncident } from "../repositories/incidents.repository.js";
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

export const getSummary = async (id, range) => {
    const rangeStart = convertToDate(range);
    const rangeEnd = new Date();

    const [heartbeatRes, openRes, resolvedRes] = await Promise.all([
        getHeartbeatSummary(id, rangeStart),
        getOpenIncidents(id, rangeStart, rangeEnd),
        getResolvedIncident(id, rangeStart, rangeEnd)
    ]);

    const heartbeat = heartbeatRes[0] || { totalCount: 0, uptimeCount: 0, avgResponseTime: 0 };
    const open = openRes[0] || { count: 0, openDowntime: 0 };
    const resolved = resolvedRes[0] || { count: 0, resolvedDowntime: 0 };

    const openDownTime = open.openDowntime || 0;
    const resolvedDownTime = resolved.resolvedDowntime || 0;

    const totalDownTimeMs = openDownTime + resolvedDownTime;
    const totalCount = (open.count || 0) + (resolved.count || 0);

    const summary = {
        uptimePercentage: heartbeat.totalCount 
            ? (heartbeat.uptimeCount / heartbeat.totalCount) * 100 
            : null,
        avgResponseTime: heartbeat.avgResponseTime || 0,
        totalDownTime: Math.floor(totalDownTimeMs / 1000),
        failureCount: totalCount,
    };

    return summary;
};
