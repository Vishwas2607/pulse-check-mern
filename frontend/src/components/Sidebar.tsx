import { postLogout } from "@/features/auth/api";
import { useAuthentication } from "@/features/auth/context/AuthenticationContext";
import { Monitor, HomeIcon,LucideLogIn, UserPlus, Plus} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";

export default function Sidebar(){
    const{authenticatedDetails,verifyAuth} = useAuthentication();
    const navigate = useNavigate();

    const handleClick = async() => {
        try{
            const result = await postLogout();
            await verifyAuth();
            toast.warning(result.messge, {
                description: "You have been securely signed out."
            })
            navigate("/login", {replace:true});

        } catch (err) {
            toast.error("Failed to logout", {
                description: err instanceof Error ? err.message : "Something went wrong, try again"
            })
        }
    };

    return(
        <nav className="sidebar px-0">
            <NavLink to={"/"} className={({isActive})=> isActive ? "active-sidebar-link": "sidebar-link" }><HomeIcon/>Home</NavLink>

            {authenticatedDetails.authenticated !== "authenticated" && (
                <>
                    <NavLink to={"/login"} className={({isActive})=> isActive ? "active-sidebar-link": "sidebar-link"}><LucideLogIn/>Login</NavLink>
                    <NavLink to={"/register"} className={({isActive})=> isActive ? "active-sidebar-link": "sidebar-link"}><UserPlus/>Register</NavLink>
                </>
            )}
            {authenticatedDetails.authenticated === "authenticated" && (
                <>
                <NavLink to={"/monitors"} className={({isActive})=> isActive ? "active-sidebar-link": "sidebar-link"}><Monitor/>Monitors</NavLink>
                <NavLink to={"/add-monitor"} className={({isActive})=> isActive ? "active-sidebar-link": "sidebar-link"}><span className="relative inline-block"><Monitor/> <Plus className="absolute top-1 left-1.5 " size={12}/></span>Add Monitor</NavLink>

                <div className="w-full flex-1 flex justify-center items-end mb-12">
                    <button className="btn btn-danger" onClick={handleClick}>Logout</button>
                </div>
                </>
            )}
        </nav>
    )
}
