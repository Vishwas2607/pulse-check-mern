import type { GetIncidentstype } from "../types";
import { Dot } from "lucide-react";
import React from "react";
import clsx from "clsx";
import { STATUS_STYLES } from "../../../utils/constants";
import dayjs from "dayjs";

export const IncidentCard = React.memo(({status,startedAt,resolvedAt,currentStatus,durationInSeconds,isActive}:GetIncidentstype)=> {

    const durationInMins = Math.floor(durationInSeconds/60)
    const duration = isActive ? `Down for ${durationInMins}` : `Was down for ${durationInMins}`;
    const statusStyle = isActive ? STATUS_STYLES.DOWN : STATUS_STYLES.UP;
    return (
        <div className="w-full">
              <div className="flex-between">
                <div className="card-content flex gap-6 flex-col md:flex-row">
                  <span className="card-title capitalize">Status: {status}</span>
                  {startedAt && <span>StartedAt: {dayjs(startedAt).format("MMM DD, YYYY HH:mm")}</span>}
                  {resolvedAt && <span>ResolvedAt: {dayjs(resolvedAt).format("MMM DD, YYYY HH:mm")}</span>}
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