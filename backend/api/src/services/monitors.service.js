import { monitorQueue } from "../queues/monitor.queue.js";
import { getCurrentIncidentFromDB } from "../repositories/incidents.repository.js";
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