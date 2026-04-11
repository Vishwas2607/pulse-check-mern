import apiClient from "../../api/client";

export async function getMonitors () {

    const response = await apiClient.get("/monitors");

    return response.data.monitors;
}

export async function getIncidents(id:string) {
    const response = await apiClient.get(`/monitors/${id}/incidents`);

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