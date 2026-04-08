import { monitorQueue } from "../queues/monitor.queue.js";
import { getHourlyAggregate } from "../repositories/hourlyAggregate.repository.js";
import { getCurrentIncidentFromDB, getOpenIncidents} from "../repositories/incidents.repository.js";
import { createMonitor, getMonitorsFromDB, getOneMonitorFromDB } from "../repositories/monitors.repository.js"
import AppError from "../utils/appError.js"
import { convertToDate } from "../utils/helpers.js";

export const createNewMonitor = async (userId,data) => {

    if(!data || !data.url || !data.interval) throw new AppError(400, "Either fields are empty or no data provided");
    const monitor = await createMonitor({userId:userId,...data});

    await monitorQueue.add(`monitor-check-${monitor._id}`, 
    {
        monitorId: monitor._id,
        url : monitor.url,

    },
    {
        repeat: {
            every: monitor.interval * 1000,
        },
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: {count:10}

    }
)
    console.log(monitor);
    return monitor
}

export const getMonitors = async(userId) => {
    const monitors = await getMonitorsFromDB(userId);

    if(!monitors || monitors.length === 0) throw new AppError(404, "No monitors found");

    return monitors;
};

export const getMonitorStatus = async(userId,monitorId) => {
    const monitor = await getOneMonitorFromDB(userId,monitorId);

    if(!monitor) throw new AppError(404, "Monitor not found");

    const status = await getCurrentIncidentFromDB(monitorId);
    if(!status) return {status:"UNKNOWN"}
    else if(status.status=== "resolved") return {...status, status: "Up"}
    return {...status, status:"DOWN"}
}
export const getSummary = async (userId,monitorId, range) => {

    const monitor = await getOneMonitorFromDB(userId,monitorId);

    if(!monitor) throw new AppError(404, "Monitor not found");

    const rangeStart = convertToDate(range);
    const rangeEnd = new Date();

    const hourlyData = await getHourlyAggregate(monitorId,rangeStart,rangeEnd) || [];
    const [{openDownTime = 0}={}] = await getOpenIncidents(monitorId,rangeStart,rangeEnd) ;

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
    avgResponseTime : totals.upChecks === 0 ? null : parseFloat((totals.totalResponseTime/totals.upChecks).toFixed(2)),
    totalDownTime : (totals.totalDownTime || 0) + (parseFloat((openDownTime/1000).toFixed(2)) || 0),
    failureCount : totals.failureCount
    };

    return summary
};
