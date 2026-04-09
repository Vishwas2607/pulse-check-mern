type StatusType = "UP" | "DOWN";

export type MonitorsType = {id:string, url: string, interval:number, status:StatusType}

export interface GetMonitorsType {
    monitors:MonitorsType[]
};
