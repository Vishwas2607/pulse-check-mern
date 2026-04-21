import { useNavigate, useParams } from "react-router";
import type { UIType} from "../features/monitors/types";
import { IncidentCard } from "../features/monitors/components/IncidentCard";
import { useMonitorStatus } from "../features/monitors/hooks/useMonitor";
import { Dot } from "lucide-react";
import React from "react";
import { useLastHeartbeat } from "../features/monitors/hooks/useHeartbeats";
import clsx from "clsx"
import { normalizeStatus, getMonitorUiState, monitorBgStyle, monitorStatusStyle } from "../utils/helpers";
import { Link } from "react-router";
import { Loadable, Skeleton } from "@/components/Skeleton";

const MonitorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  if(!id) return <p>Id is invalid</p>; // Will redirect to 404 page

  const [, forceUpdate] = React.useState(0);
  
      React.useEffect(() => {
      const time = setInterval(() => {
          forceUpdate((x) => x + 1);
      }, 60000);
  
      return () => clearInterval(time);
      }, []);

  
  const {monitor, status,isLoading,error,isFetching, lastIncident} = useMonitorStatus(id);
  const {lastHeartbeat,isLoading:isLoadingHeartbeat} = useLastHeartbeat(id);

  if(!isLoading && !monitor) return <p className="text-center text-error">No Monitor found</p>
  
  const durationInMin = status?.isDown ?  Math.floor(status.durationInSeconds/60): 0;
  const duration = status?.isDown ? `Down for ${durationInMin} mins` : null;

  const systemStatus = normalizeStatus(status?.isDown);
  
  const lastHeartbeatStatus = lastHeartbeat?.status?.toUpperCase() ?? "UNKNOWN";
  const heartbeatStatusStyle = monitorStatusStyle(lastHeartbeatStatus);

  const ui: UIType = getMonitorUiState(systemStatus, lastHeartbeatStatus);
  const bgStyle = monitorBgStyle(ui.state);
  const statusStyle = monitorStatusStyle(ui.state);

  if(error) return <p className="text-title text-center">{error.message}</p>

  return (
    <section className="container-main mx-auto">
      <h1 className="text-title text-center">Monitor Details</h1>

      <div className="container-main w-full gap-6 flex flex-col md:flex-row mx-auto">

      <Loadable loading={isLoading} skeleton={<Skeleton childClass="w-32 h-10 bottom-7 rounded-lg left-4" className="h-60 md:h-60 rounded-xl w-full"/>}>
      {monitor && <div className= {clsx("cardWithoutHover w-full hover:shadow-sm",bgStyle )}>
        <div className=" flex justify-between">
        <div className="flex flex-col gap-6">
          <span className="card-header">MonitorId: {monitor._id}</span>
          <span className="card-title">Url: {monitor.url}</span>
          <span className="card-content">Interval: {monitor.interval}</span>
          {ui.showWarning && <span className="card-content text-red-500">Last check failed</span>}
          <Link to={`/monitors/${monitor._id}/edit-monitor`} className="btn-primary mb-2 w-fit">Edit Monitor</Link>
        </div>
            <div className={clsx("flex-center h-full", statusStyle)}>
            <Dot size={16}/>
            <span className="">{ui.state}</span>
            </div>
        </div>
        {duration && <span className="card-title">{duration}</span>}
      </div>}
      </Loadable>

        <Loadable loading={isLoadingHeartbeat} skeleton={<Skeleton childClass="hidden" className="h-50 md:h-60 rounded-xl w-full"/>}>
        <div className="card w-full flex-center flex-col">
          <h2 className="text-heading mb-6">Recent Heartbeat</h2>
          {!lastHeartbeat && <p>No heartbeats to show</p>}
          {lastHeartbeat && (

              <div key={lastHeartbeat._id} className="flex flex-col w-full text-body gap-4">
                <span className={clsx(heartbeatStatusStyle)}>Status: {lastHeartbeat.status.toUpperCase()}</span>
                <span>CheckedAt: {new Date(lastHeartbeat.checkedAt).toLocaleDateString()}</span>

                {lastHeartbeat.responseTime && <span>Response Time: {lastHeartbeat.responseTime.toFixed(2)}ms</span>}
                {lastHeartbeat.statusCode && <span>StatusCode: {lastHeartbeat.statusCode}</span>}
                {lastHeartbeat.error && <span>Error: {lastHeartbeat.error}</span>}
              </div>
          )}
        </div>
        </Loadable>
      </div>
      

      
      <div className="container-main w-full mx-auto">
      <Loadable loading={isLoading} skeleton={<Skeleton childClass="hidden" className="h-35 rounded-xl w-full max-w-7xl"/>}>
      <div className="card flex-center flex-col">
        <h2 className="text-heading mb-6">Recent Incident</h2>
        {!lastIncident && <p>No Incidents to show</p>}
        {lastIncident && <IncidentCard _id={lastIncident._id} status={lastIncident.status} startedAt={lastIncident.startedAt} resolvedAt={lastIncident.resolvedAt} currentStatus={lastIncident.currentStatus} durationInSeconds={lastIncident.durationInSeconds} isActive={lastIncident.isActive} />}
      </div>
      </Loadable>
      {isFetching && <p className="w-full mt-6">Refreshing...</p>}
      </div>
      

      <div className="flex-center gap-main ">
          <button  className="btn-secondary w-fit" onClick={()=> navigate(-1)}>Go Back</button>
          <Link to={`/monitors/${id}/analytics`} className="btn-primary w-fit">View Analytics</Link>
      </div>
      
    </section>
  );
};

export default MonitorDetails;