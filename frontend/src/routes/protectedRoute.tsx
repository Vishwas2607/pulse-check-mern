import { useAuthentication } from "@/features/auth/context/AuthenticationContext";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
    const {authenticatedDetails} = useAuthentication();

    if(authenticatedDetails.authenticated === "loading") {
        return <p>Loading...</p>
    };

    if(authenticatedDetails.authenticated === "unauthenticated") {
        return <Navigate to="/login" replace/>
    };

    return <Outlet/>
}