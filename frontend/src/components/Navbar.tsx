import { postLogout } from "@/features/auth/api";
import { useAuthentication } from "@/features/auth/context/AuthenticationContext";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";

export default function Navbar(){
    const{authenticatedDetails,verifyAuth} = useAuthentication();
    const navigate = useNavigate();

    const handleClick = async() => {
        try{
            const result = await postLogout();
            await verifyAuth();
            toast.warning(result.message, {
                description: "You have been securely signed out."
            })
            navigate("/login", {replace:true});

            console.log(result.message)
        } catch (err) {
            toast.error("Failed to logout", {
                description: err instanceof Error ? err.message : "Something went wrong, try again"
            })
        }
    };

    return (
        <nav className="text-body flex-center gap-6 mr-3">
            <NavLink to={"/"} className={({isActive})=> isActive ? "active-link" : "link"}>Home</NavLink>

            {authenticatedDetails.authenticated !== "authenticated" &&(
                <>
                <NavLink to={"/login"} className={({isActive})=> isActive ? "active-link" : "link"}>Login</NavLink>
                <NavLink to={"/register"} className={({isActive})=> isActive ? "active-link" : "link"}>Register</NavLink>
                </>
            )}
            {authenticatedDetails.authenticated === "authenticated" && (
                <>
                <NavLink to={"/monitors"} className={({isActive})=> isActive ? "active-link" : "link"}>Monitors</NavLink>
                <NavLink to={"/add-monitor"} className={({isActive})=> isActive ? "active-link" : "link"}>Add Monitor</NavLink>
                <button className="btn btn-danger py-1" onClick={handleClick}>Logout</button>
                </>
            )}
        </nav>
    )
}