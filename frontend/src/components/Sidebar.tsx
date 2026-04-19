import { postLogout } from "@/features/auth/api";
import { useAuthentication } from "@/features/auth/context/AuthenticationContext";
import { Monitor, HomeIcon,LucideLogIn, UserPlus } from "lucide-react";
import { NavLink, useNavigate } from "react-router";

export default function Sidebar(){
    const{authenticatedDetails,verifyAuth} = useAuthentication();
    const navigate = useNavigate();

    const handleClick = async() => {
        try{
            const result = await postLogout();
            await verifyAuth();
            navigate("/login", {replace:true});

            console.log(result.message)
        } catch (err) {
            console.error(err);
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
                
                <div className="w-full flex-1 flex justify-center items-end mb-12">
                    <button className="btn btn-danger" onClick={handleClick}>Logout</button>
                </div>
                </>
            )}
        </nav>
    )
}
