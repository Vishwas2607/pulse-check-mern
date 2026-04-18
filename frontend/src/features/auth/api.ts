import apiClient from "@/api/client";
import type { LoginFormValues, RegisterPostDataType } from "./types";

export async function postRegister (data: RegisterPostDataType) {

    const response = await apiClient.post("/auth/register",data);

    return response.data;
}

export async function postLogin(data:LoginFormValues) {
    const response = await apiClient.post("/auth/login",data);

    return response.data;
}

export async function getAuthMe() {
    const response = await apiClient.get("/auth/me");
    return response.data;
}