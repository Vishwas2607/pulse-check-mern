import { useParams } from "react-router";
import { useIncidents } from "../features/monitors/hooks/useIncidents";
import type { GetIncidentstype, UIType} from "../features/monitors/types";
import { IncidentCard } from "../features/monitors/components/IncidentCard";
import { useMonitorStatus } from "../features/monitors/hooks/useMonitor";
import { Dot } from "lucide-react";
import React from "react";
import { useLastHeartbeat } from "../features/monitors/hooks/useHeartbeats";
import clsx from "clsx"
import { normalizeStatus, getMonitorUiState, monitorBgStyle, monitorStatusStyle } from "../utils/helpers";

const MonitorDetails = () => {
  const { id } = useParams();
  if(!id) return <p>Id is invalid</p>; // Will redirect to 404 page

  const [, forceUpdate] = React.useState(0);
  
      React.useEffect(() => {
      const time = setInterval(() => {
          forceUpdate((x) => x + 1);
      }, 60000);
  
      return () => clearInterval(time);
      }, []);

  
  const {monitor, status,isLoading,error,isFetching} = useMonitorStatus(id);
  const {lastHeartbeat,isLoading:isLoadingHeartbeat, isFetching:isFetchingHeartbeat, error:isHeartbeatError} = useLastHeartbeat(id);

  const {incidents, nextCursor,isLoading:isIncidentLoading, isFetching:isIncidentFetching,error:isIncidentError} = useIncidents(id);

  if(isLoading) return <p>Loading...</p>
  if(error) return <p>Something went Wrong</p>

  if(!monitor) return <p>Monitor not found</p> // Redirect to 404 page

  const durationInMin = status?.isDown ?  Math.floor(status.durationInSeconds/60): 0;
  const duration = status?.isDown ? `Down for ${durationInMin} mins` : null

  const systemStatus = normalizeStatus(status?.isDown);
  
  const lastHeartbeatStatus = lastHeartbeat?.status?.toUpperCase() ?? "UNKNOWN";
  const heartbeatStatusStyle = monitorStatusStyle(lastHeartbeatStatus);

  const ui: UIType = getMonitorUiState(systemStatus, lastHeartbeatStatus);
  const bgStyle = monitorBgStyle(ui.state);
  const statusStyle = monitorStatusStyle(ui.state);

  return (
    <section className="container-app section gap-10">
      <h1 className="text-title text-center">Monitor Details</h1>

    <div className="container-main w-full gap-6 flex flex-col md:flex-row">
      <div className= {clsx("cardWithoutHover w-full hover:shadow-sm",bgStyle )}>
        <div className=" flex justify-between">
        <div className="flex flex-col gap-6">
          <span className="card-header">MonitorId: {monitor._id}</span>
          <span className="card-title">Url: {monitor.url}</span>
          <span className="card-content">Interval: {monitor.interval}</span>
          {ui.showWarning && <span className="card-content text-red-500">Last check failed</span>}
        </div>
            <div className={clsx("flex-center h-full", statusStyle)}>
            <Dot size={16}/>
            <span className="">{ui.state}</span>
            </div>
        </div>
        {duration && <span className="card-title">{duration}</span>}
      </div>

        <div className="card w-full flex-center flex-col">
          <h2 className="text-heading mb-6">Recent Heartbeat</h2>
          {!lastHeartbeat && <p>No heartbeats to show</p>}
          {lastHeartbeat && (

              <div key={lastHeartbeat._id} className="flex flex-col w-full text-body gap-4">
                <span className={clsx(heartbeatStatusStyle)}>Status: {lastHeartbeat.status.toUpperCase()}</span>
                <span>CheckedAt: {new Date(lastHeartbeat.checkedAt).toLocaleDateString()}</span>

                {lastHeartbeat.responseTime && <span>Response Time: {lastHeartbeat.responseTime}ms</span>}
                {lastHeartbeat.statusCode && <span>StatusCode: {lastHeartbeat.statusCode}</span>}
                {lastHeartbeat.error && <span>Error: {lastHeartbeat.error}</span>}
              </div>
          )}
        </div>
      </div>

      <div className="container-main w-full">
      <div className="card flex-center flex-col">
        <h2 className="text-heading mb-6">Incident History</h2>
      {incidents.length === 0 && <p>No incidents to show</p>}
        <ul className="w-full flex flex-col gap-6">
          {incidents.map((i:GetIncidentstype)=> (
            <IncidentCard key={i._id} _id={i._id} startedAt={i.startedAt} resolvedAt={i.resolvedAt} status={i.status} isActive={i.isActive} durationInSeconds={i.durationInSeconds} currentStatus={i.currentStatus}/>
          ))}
        </ul>
      {isFetching && <p className="w-full mt-6">Refreshing...</p>}
      </div>
      </div>
    </section>
  );
};

export default MonitorDetails;