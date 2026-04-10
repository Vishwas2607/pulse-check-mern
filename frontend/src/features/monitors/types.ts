type StatusType = "UP" | "DOWN";
type LastIncidentType = {startedAt: string | null, resolvedAt: string | null}
export type MonitorsType = {id:string, url: string, interval:number, status:StatusType, lastIncident: LastIncidentType}

export interface GetMonitorsType {
    monitors:MonitorsType[]
};
