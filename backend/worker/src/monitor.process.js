import logger from "./utils/logger.js";
import { processHeartbeat, saveHeartbeat } from "./services/heartbeat.service.js";
import { updateAggregation } from "./services/aggregation.service.js";
import { getHeartbeatsFromDB } from "../../api/src/repositories/heartbeats.repository.js";
import { handleIncidentCreation, handleIncidentResolution } from "./services/incidents.service.js";
import { getMonitorByMonitorId } from "../../api/src/repositories/monitors.repository.js";

const monitorProcessor = async(job) => {
    const {url,monitorId} = job.data;

    logger.info(`Job received`, { jobId: job.id, monitorId, url });

    const monitor = await getMonitorByMonitorId(monitorId)
    if(!monitor) return;

    const heartbeatData = await processHeartbeat({url,monitorId,jobId: job.id});

    const {created} = await saveHeartbeat(heartbeatData);

    await updateAggregation({
        monitorId,
        status: heartbeatData.status,
        latency: heartbeatData?.responseTime ?? 0,
        created
    });

    const heartbeats = await getHeartbeatsFromDB(monitorId,0,3);

    if(heartbeatData.status === "down") {
        await handleIncidentCreation(monitorId, heartbeats);
    } else {
        await handleIncidentResolution(monitorId)
    }
        


}

export default monitorProcessor;