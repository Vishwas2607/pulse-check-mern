import { monitorQueue } from "../queues/monitor.queue.js";
import { getHourlyAggregate } from "../repositories/hourlyAggregate.repository.js";
import { getCurrentIncidentFromDB, getOpenIncidents, getRecentIncidentsBulk} from "../repositories/incidents.repository.js";
import { createMonitor, getMonitorsFromDB, updateMonitor,deleteMonitor, getOneMonitorFromDB} from "../repositories/monitors.repository.js"
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

export const getMonitorStatus = async(monitorId,userId) => {
    const monitorDetail = await getOneMonitorFromDB(userId,monitorId) || [];
    const lastIncident = await getCurrentIncidentFromDB(monitorId);
    const start = new Date(lastIncident.startedAt).getTime();
    const end = lastIncident.resolvedAt ? new Date(lastIncident.resolvedAt).getTime() : Date.now();

    return {
        ...monitorDetail,
        isDown: lastIncident.status === "open",
        durationInSeconds: Math.max(0, Math.floor((end - start) / 1000)),
    }
}

export const getMonitors = async(userId) => {
    const monitors = await getMonitorsFromDB(userId);

    if(!monitors || monitors.length === 0) throw new AppError(404, "No monitors found");
    const monitorIds = monitors.map(m=>m._id.toString())
    const allMonitorStatus = await getRecentIncidentsBulk(monitorIds) || [];

    const statusMap = new Map(allMonitorStatus.map(s=> [s.monitorId, {status: s.status === "open"? "DOWN": "UP", startedAt: s.startedAt, resolvedAt:s.resolvedAt}]))

    const merged = monitors.map(m => {
        const incident = statusMap.get(m._id.toString());

        return {
            ...m,
            status: incident?.status ?? "UP",
            lastIncident: {
                startedAt: incident?.startedAt ?? null,
                resolvedAt: incident?.resolvedAt ?? null
            }
    }})
    return merged;
};

export const getSummary = async (monitorId, range) => {

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


export const updateMonitorService = async (monitorId,data) => {
    const {url,interval} = data;

    const updateFields = {};

    if(url) updateFields.url = url;
    if(interval) updateFields.interval = interval;

    const updatedMonitor = await updateMonitor(monitorId, updateFields);

    if(!updatedMonitor) throw new AppError(400,"No document found with that ID; nothing updated");

    await monitorQueue.add(
        `monitor-check-${monitorId}`,
        { monitorId: updatedMonitor._id, url: updatedMonitor.url },
        {
            repeat: { every: updatedMonitor.interval * 1000 },
            attempts: 5,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: true,
            removeOnFail: { count: 10 },
        }
    );
    return updatedMonitor;
}

export const deleteMonitorService = async(monitorId) => {
    const deletedMonitor = await deleteMonitor(monitorId);

    if(!deletedMonitor) throw new AppError(400, "No monitor found with that ID; nothing deleted");

    const jobs = await monitorQueue.getJobSchedulers(0,-1);

    const matchedJobs = jobs.filter(job => job.name.includes(monitorId));

    await deleteHeartbeatsByMonitor(monitorId);
    await deleteIncidentsByMonitor(monitorId);

    await Promise.all(matchedJobs.map(job => monitorQueue.removeJobScheduler(job.id)));

    return deletedMonitor;
}