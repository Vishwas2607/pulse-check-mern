import {createMonitorSchema} from "../../../../lib/schemas/monitor.validator";
import {z} from "zod";

export type StatusType = "UP" | "DOWN" | "UNKNOWN";
type LastIncidentType = {startedAt: string | null, resolvedAt: string | null}
export type MonitorsType = {_id:string, url: string, interval:number, status:StatusType, lastIncident: LastIncidentType}

export interface GetMonitorsType {
    monitors:MonitorsType[]
};


export interface GetIncidentstype {
    _id:string,
    status: "open" | "resolved",
    startedAt:  Date | null | undefined,
    resolvedAt: Date| null | undefined,
    isActive: boolean,
    durationInSeconds: number,
    currentStatus: "DOWN" |"UP"
}

export interface GetLastHeartbeatType {
    _id:string,
    status: "up" | "down",
    checkedAt: Date,
    responseTime: number | null,
    statusCode: number | null,
    error: string | null
}

export interface UIType {
    state: StatusType,
    showPulse: boolean,
    showWarning: boolean
}

export interface SummaryType {
    uptimePercentage: number | null,
    avgResponseTime: number | null,
    totalDownTime: number | null,
    failureCount: number | null
}

export interface SeriesType {
    timestamp:Date,
    uptimePercentage: number | null,
    avgResponseTime: number| null,
    failureCount: number|null
}


export type UptimeSeries = Pick<SeriesType, 'timestamp' | 'uptimePercentage'>;
export type ResponseSeries = Pick<SeriesType, 'timestamp' | "avgResponseTime">;
export type FailureSeries = Pick<SeriesType, 'timestamp' | "failureCount">;
export type RangeType = "24h" | "7d" | "15d" | "30d";
 
export type CreateMonitorType = z.infer<typeof createMonitorSchema>

export interface IncidentResponseType {
    incidents: GetIncidentstype[],
    nextCursor: string,
    hasNextPage: boolean
}

export interface HeartbeatResponseType {
    heartbeats: GetLastHeartbeatType[],
    nextCursor: string,
    hasNextPage: boolean
}