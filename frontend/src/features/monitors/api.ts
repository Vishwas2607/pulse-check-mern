import apiClient from "../../api/client";
import type { CreateMonitorType, HeartbeatResponseType, IncidentResponseType, RangeType } from "./types";

export async function getMonitors () {

    const response = await apiClient.get("/monitors");

    return response.data.monitors;
}

export async function createMonitor(data:CreateMonitorType) {
    const response = await apiClient.post("/monitors",data);

    return response.data;
}

export async function updateMonitor(id:string|undefined,data:CreateMonitorType) {
    const response = await apiClient.patch(`/monitors/${id}`, data);
    return response.data;
}

export async function deleteMonitor(id:string) {
    const response = await apiClient.delete(`/monitors/${id}`);
    return response.data;
}

export async function getIncidents(id:string,nextCursor:string):Promise<IncidentResponseType> {
    const response = await apiClient.get(`/monitors/${id}/incidents?cursor=${nextCursor}`);

    return response.data;
}

export async function getMonitorStatus(id:string) {
    const response = await apiClient.get(`/monitors/${id}`);

    return response.data;
}

export async function getLastHeartbeat(id:string) {
    const response = await apiClient.get(`/monitors/${id}/heartbeats/recent-heartbeat`);
    return response.data;
    
}

export async function getMonitorSummary(id:string,range:RangeType) {
    const response = await apiClient.get(`/monitors/${id}/summary?range=${range}`);
    return response.data;
}

export async function getHeartbeats(id:string, nextCursor:string):Promise<HeartbeatResponseType> {
    const response = await apiClient.get(`/monitors/${id}/heartbeats?cursor=${nextCursor}`)
    return response.data
}