import type { GetIncidentstype } from "../types";
import { Dot } from "lucide-react";
import React from "react";
import clsx from "clsx";
import { STATUS_STYLES } from "../../../utils/constants";

export const IncidentCard = React.memo(({status,startedAt,resolvedAt,currentStatus,durationInSeconds,isActive}:GetIncidentstype)=> {

    const durationInMins = Math.floor(durationInSeconds/60)
    const duration = isActive ? `Down for ${durationInMins}` : `Was down for ${durationInMins}`;
    const statusStyle = isActive ? STATUS_STYLES.DOWN : STATUS_STYLES.UP;
    return (
        <div className="w-full">
              <div className="flex-between">
                <div className="card-content flex gap-6">
                  <span className="card-title capitalize">Status: {status}</span>
                  {startedAt && <span>StartedAt: {new Date(startedAt).toLocaleDateString()}</span>}
                  {resolvedAt && <span>ResolvedAt: {new Date(resolvedAt).toLocaleDateString()}</span>}
                </div>
                <div className={clsx("flex-center", statusStyle, (isActive && "animate-pulse"))}>
                  <Dot size={16}/>
                  <span>{currentStatus}</span></div>
              </div>

              <div className={clsx("card-title", isActive && "text-red-500/90")}>Duration: {duration} mins</div>
         </div>
    )
});

IncidentCard.displayName = "IncidentCard";