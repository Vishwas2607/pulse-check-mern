import { monitorQueue } from "../queues/monitor.queue.js";
import { getHourlyAggregate } from "../repositories/hourlyAggregate.repository.js";
import { getCurrentIncidentFromDB, getOpenIncidents} from "../repositories/incidents.repository.js";
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

    const hourlyData = await getHourlyAggregate(id,rangeStart,rangeEnd) || [];
    const [{openDownTime = 0}={}] = await getOpenIncidents(id,rangeStart,rangeEnd) ;

    const initial = {
        totalChecks: 0,
        upChecks: 0,
        totalResponseTime: 0,
        totalDownTime: 0,
        failureCount: 0
        };

    const totals = hourlyData.reduce((acc,curr)=> {
        acc.totalChecks += curr.totalChecks || 0;
        acc.upChecks += curr.upChecks || 0;
        acc.totalResponseTime += curr.totalResponseTime || 0;
        acc.totalDownTime += curr.totalDownTime || 0;
        acc.failureCount += curr.failureCount || 0;
        return acc;
    },initial)


    const summary = {
    uptimePercentage : totals.totalChecks === 0 ? null : (totals.upChecks/totals.totalChecks)*100,
    avgResponseTime : totals.upChecks === 0 ? null : parseInt((totals.totalResponseTime/totals.upChecks).toFixed(2)),
    totalDownTime : (totals.totalDownTime || 0) + (parseInt((openDownTime/1000).toFixed(2)) || 0),
    failureCount : totals.failureCount
    };

    return summary
};
