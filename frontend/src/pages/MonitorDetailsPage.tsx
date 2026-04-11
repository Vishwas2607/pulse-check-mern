import { useParams } from "react-router";
import { useIncidents } from "../features/monitors/hooks/useIncidents";
import type { GetIncidentstype, GetLastHeartbeatType } from "../features/monitors/types";
import { IncidentCard } from "../features/monitors/components/IncidentCard";
import { useMonitorStatus } from "../features/monitors/hooks/useMonitor";
import { Dot } from "lucide-react";
import React from "react";
import { useLastHeartbeat } from "../features/monitors/hooks/useHeartbeats";

const MonitorDetails = () => {
  const { id } = useParams();
  if(!id) return; // Will redirect to 404 page

  const [, forceUpdate] = React.useState(0);
  
      React.useEffect(() => {
      const time = setInterval(() => {
          forceUpdate((x) => x + 1);
      }, 60000);
  
      return () => clearInterval(time);
      }, []);

  const {monitorStatus,isLoading,error,isFetching} = useMonitorStatus(id);
  const {lastHeartbeat,isLoading:isLoadingHeartbeat, isFetching:isFetchingHeartbeat, error:isHeartbeatError} = useLastHeartbeat(id);

  const {incidents, nextCursor,isLoading:isIncidentLoading, isFetching:isIncidentFetching,error:isIncidentError} = useIncidents(id);

  if(isLoading) return <p>Loading...</p>
  if(error) return <p>Something went Wrong</p>
  if(!monitorStatus || monitorStatus.length === 0) return // Redirect to 404 page
  const durationInMin = monitorStatus.isDown ??  Math.floor(monitorStatus.durationInSeconds/60);
  const duration = monitorStatus.isDown ? `Down for ${durationInMin} mins` : null

  return (
    <div className="container-app section">
      <h1 className="text-title">Monitor Details</h1>

      <div>
        <div>
        <div>
          <span>MonitorId: {monitorStatus._id}</span>
          <span>Url: {monitorStatus.url}</span>
          <span>Interval: {monitorStatus.interval}</span>
        </div>
        <span><Dot size={16}/>{monitorStatus.isDown ? "DOWN" : "UP"}</span>
        </div>
        {duration && <span>{duration}</span>}
      </div>

      <div>
        <h2>Recent Heartbeat</h2>
        {lastHeartbeat.length === 0 && <p>No heartbeats to show</p>}
        {lastHeartbeat.length > 0 && (
          lastHeartbeat.map((h:GetLastHeartbeatType)=> (
            <div key={h._id}>
              <span>Status: {h.status}</span>
              <span>CheckedAt: {new Date(h.checkedAt).toLocaleDateString()}</span>

              {h.responseTime && <span>Response Time: {h.responseTime}ms</span>}
              {h.statusCode && <span>StatusCode: {h.statusCode}</span>}
              {h.error && <span>Error: {h.error}</span>}
            </div>
          ))
        )}
      </div>

      <div>
        <h2>Incident History</h2>
      {incidents.length === 0 && <p>No incidents to show</p>}
      {incidents && (
        <ul>
          {incidents.map((i:GetIncidentstype)=> (
            <IncidentCard key={i._id} _id={i._id} startedAt={i.startedAt} resolvedAt={i.resolvedAt} status={i.status} isActive={i.isActive} durationInSeconds={i.durationInSeconds} currentStatus={i.currentStatus}/>
          ))}
        </ul>
      )}
      {isFetching && <p>Refreshing...</p>}
      </div>
    </div>
  );
};

export default MonitorDetails;