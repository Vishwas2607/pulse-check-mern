import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { type AuthenticationDetailsType, type AuthenticationContextType } from "../types";
import { getAuthMe } from "../api";

const AuthenticationContext = createContext<AuthenticationContextType | null>(null);

export function AuthenticationProvider ({children}: {children:ReactNode}) {
    const [authenticatedDetails, setAuthenticated] = useState<AuthenticationDetailsType>({authenticated:"loading", username:"Guest"});

    const verifyAuth = useCallback(async()=> {
        try{
            const data = await getAuthMe();
            setAuthenticated({authenticated:data.authenticated ? "authenticated": "unauthenticated", username: data.username})
        } catch {
            setAuthenticated({authenticated:"unauthenticated", username: "Guest"})
        }
    },[])

    const markUnauthenticated = () => {
        setAuthenticated({authenticated:"unauthenticated", username: "Guest"})
    }

    useEffect(()=> {
        verifyAuth();
    },[]);

    return <AuthenticationContext.Provider value={{authenticatedDetails,markUnauthenticated,verifyAuth}}>
        {children}
    </AuthenticationContext.Provider>

};

export function useAuthentication() {
    const context = useContext(AuthenticationContext);

    if(!context) throw new Error("useAuthentication must be used inside <AuthenticationProvider>");

    return context;
}