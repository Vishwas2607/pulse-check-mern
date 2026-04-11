import type { GetIncidentstype } from "../types";
import { Dot } from "lucide-react";
import React from "react";

export const IncidentCard = React.memo(({_id,status,startedAt,resolvedAt,currentStatus,durationInSeconds,isActive}:GetIncidentstype)=> {
    const [, forceUpdate] = React.useState(0);

    React.useEffect(() => {
    const time = setInterval(() => {
        forceUpdate((x) => x + 1);
    }, 60000);

    return () => clearInterval(time);
    }, []);

    const durationInMins = Math.floor(durationInSeconds/60)
    const duration = isActive ? `Down for ${durationInMins}` : `Was down for ${durationInMins}`
    return (
        <li>
              <div>
                <div>
                  <span>Status: {status}</span>
                  {startedAt && <span>StartedAt: {new Date(startedAt).toLocaleDateString()}</span>}
                  {resolvedAt && <span>ResolvedAt: {new Date(resolvedAt).toLocaleDateString()}</span>}
                </div>
                <span><Dot size={16}/>{currentStatus}</span>
              </div>

              <div>Duration: {duration}</div>
         </li>
    )
});

IncidentCard.displayName = "IncidentCard";