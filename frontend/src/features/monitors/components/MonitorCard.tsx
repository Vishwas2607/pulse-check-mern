import type { MonitorsType } from "../types"
import React from "react"
import { Dot } from "lucide-react";
import clsx from "clsx";
import { STATUS_STYLES, STATUS_BG_STYLES } from "../../../utils/constants";

const getMinutes = (from: string, to: number) => {
  return Math.max(
    0,
    Math.floor((to - new Date(from).getTime()) / 60000)
  );
};

export const MonitorCard = React.memo(({id, url,interval,status,lastIncident}: MonitorsType) => {
    const [, forceUpdate] = React.useState(0);

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
    } else if (lastIncident.resolvedAt) {
        const mins = getMinutes(
        lastIncident.startedAt,
        new Date(lastIncident.resolvedAt).getTime()
        );

        if (mins === 0) incidentMessage = "Was down just now";
        else if (mins === 1) incidentMessage = "Was down for 1 min";
        else incidentMessage = `Was down for ${mins} mins`;
    }
    }

    return (
        <li className={clsx("p-4 rounded-md", STATUS_BG_STYLES[status])}>
            <span>Url: {url}</span> | <span>Interval: {interval}s</span>
            <span className={clsx("flex items-center gap-1 font-medium",STATUS_STYLES[status])}><Dot size={16}/>Status: {status}</span>
            <span>{incidentMessage}</span>
        </li>
    )
});

MonitorCard.displayName = "MonitorCard";