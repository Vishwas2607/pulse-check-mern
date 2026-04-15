export type StatusType = "UP" | "DOWN" | "UNKNOWN";
type LastIncidentType = {startedAt: string | null, resolvedAt: string | null}
export type MonitorsType = {_id:string, url: string, interval:number, status:StatusType, lastIncident: LastIncidentType}

export interface GetMonitorsType {
    monitors:MonitorsType[]
};


export interface GetIncidentstype {
    _id:string,
    status: "Open" | "resolved",
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