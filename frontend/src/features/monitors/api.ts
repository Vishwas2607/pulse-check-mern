import apiClient from "../../api/client";

export async function getMonitors () {

    const response = await apiClient.get("/monitors");

    return response.data.monitors;
}
