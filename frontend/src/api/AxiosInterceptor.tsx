import { useEffect } from "react";
import { useNavigate } from "react-router"
import apiClient from "./client";
import { toast } from "sonner";
import { useAuthentication } from "@/features/auth/context/AuthenticationContext";

export const AxiosInterceptor = ({children}: {children: React.ReactNode}) => {
    const navigate = useNavigate();
    const {markUnauthenticated} = useAuthentication();
    useEffect(()=> {
        const responseInterceptor = apiClient.interceptors.response.use(
            (response) =>response,
            (error) => {
                if(error.response?.status === 401) {
                    markUnauthenticated()
                    navigate("/login")
                    toast.warning("Session expired",{description: "Please login again."})
                }
                if(error.response?.status === 403) {
                    navigate("/*");
                }
                return Promise.reject(error)
            }
        );
        return () => apiClient.interceptors.response.eject(responseInterceptor);
    },[navigate,markUnauthenticated])

    return <>{children}</>
}