import type { GetLastHeartbeatType } from "../types";
import { Dot } from "lucide-react";
import React from "react";
import clsx from "clsx";

export const HeartbeatCard = React.memo(({status, checkedAt,responseTime,statusCode,error}:GetLastHeartbeatType)=> {

    const statusStyle = status === "down" ? "text-red-500" : "text-green-500";
    return (
        <div className="w-full">
              <div className="flex-between">
                <div className="card-content flex gap-6">
                  <span className="card-title capitalize">Status: {status}</span>
                  <span>StartedAt: {new Date(checkedAt).toLocaleDateString()}</span>
                  {responseTime && <span>Response Time: {responseTime.toFixed(2)}ms</span>}
                  {statusCode && <span>Status Code: {statusCode}</span>}
                </div>
                <div className={clsx("flex-center uppercase", statusStyle)}>
                  <Dot size={16}/>
                  <span>{status}</span></div>
              </div>

              {error && <div className="card-title text-red-500/90">Error: {error}</div>}
         </div>
    )
});

HeartbeatCard.displayName = "IncidentCard";