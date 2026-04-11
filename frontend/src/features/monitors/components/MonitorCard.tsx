import type { MonitorsType } from "../types"
import React from "react"
import { Dot } from "lucide-react";
import clsx from "clsx";
import { STATUS_STYLES, STATUS_BG_STYLES } from "../../../utils/constants";
import { useNavigate } from "react-router";

const getMinutes = (from: string, to: number) => {
  return Math.max(
    0,
    Math.floor((to - new Date(from).getTime()) / 60000)
  );
};

export const MonitorCard = React.memo(({_id:id, url,interval,status,lastIncident}: MonitorsType) => {
    const [, forceUpdate] = React.useState(0);
    const navigate = useNavigate()

    React.useEffect(() => {
    const time = setInterval(() => {
        forceUpdate((x) => x + 1);
    }, 60000);

    return () => clearInterval(time);
    }, []);

    let incidentMessage = "No incidents";

    if (lastIncident?.startedAt) {
    if (status === "DOWN") {
        const mins = getMinutes(lastIncident.startedAt, Date.now());

        if (mins === 0) incidentMessage = "Down just now";
        else if (mins === 1) incidentMessage = "Down for 1 min";
        else incidentMessage = `Down for ${mins} mins`;
    } else if (lastIncident?.resolvedAt) {
        const mins = getMinutes(
        lastIncident.startedAt,
        new Date(lastIncident.resolvedAt).getTime()
        );

        if (mins === 0) incidentMessage = "Was down just now";
        else if (mins === 1) incidentMessage = "Was down for 1 min";
        else incidentMessage = `Was down for ${mins} mins`;
    }
    }

    const bgstyle = STATUS_BG_STYLES[status] ?? STATUS_BG_STYLES["UNKNOWN"];
    const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES["UNKNOWN"];
    const isDown = status === "DOWN" ;

    return (
        <li className={clsx("p-4 rounded-md card hover:scale-[1.01] cursor-pointer", bgstyle)} onClick={() => navigate(`/monitors/${id}`)}>
            <div className="flex justify-between items-start mb-4">
            <div>
                <div className="card-title">URL: {url}</div>
                <div className="card-title">Interval: {interval}s</div>
            </div>

            <div className={clsx("flex items-center gap-1 font-medium", statusStyle, (isDown && "animate-pulse"))}>
                <Dot size={16} />
                {status}
            </div>
            </div>

            <div className="card-content mt-2">
            {incidentMessage}
            </div>
        </li>
    )
});

MonitorCard.displayName = "MonitorCard";