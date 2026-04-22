import type { MonitorsType } from "../types"
import React from "react"
import { Dot } from "lucide-react";
import clsx from "clsx";
import { STATUS_STYLES, STATUS_BG_STYLES } from "../../../utils/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMonitor } from "../api";
import { Link } from "react-router";
import { toast } from "sonner";

const getMinutes = (from: string, to: number) => {
  return Math.max(
    0,
    Math.floor((to - new Date(from).getTime()) / 60000)
  );
};

export const MonitorCard = React.memo(({_id:id, url,interval,status,lastIncident}: MonitorsType) => {
    const queryClient = useQueryClient();

    const {mutate,isPending} = useMutation({
        mutationFn: async(id:string) => await deleteMonitor(id),
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ["monitors"]});
        },
        onSuccess: () => {
            toast.warning("Monitor deleted", {
                description: "You can no longer track this monitor"
            })
        },
        onError: (error) => {
            toast.error("Failed to delete monitor", {
                description: error.message
            })
            console.error("Mutation error", error);
        }
    });

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
    };

    const bgstyle = STATUS_BG_STYLES[status] ?? STATUS_BG_STYLES["UNKNOWN"];
    const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES["UNKNOWN"];
    const isDown = status === "DOWN" ;

    return (
        <li className={clsx("p-4 rounded-md cardWithoutHover hover:shadow-sm hover:scale-[1.01] cursor-pointer", bgstyle)}>
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

            <div className="card-content mt-2 flex flex-col w-fit gap-main">
            {incidentMessage}
            <div className="flex gap-main">
                <Link className="btn-primary" to={`/monitors/${id}`}>View Details</Link>
                <button className="btn-danger w-fit disabled:btn-disabled" onClick={()=>mutate(id)} disabled={isPending}>{isPending ? "Deleting...": "Delete"}</button>
            </div>
            </div>
        </li>
    )
});

MonitorCard.displayName = "MonitorCard";