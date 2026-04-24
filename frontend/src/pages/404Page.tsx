import { Ghost } from "lucide-react";
import { useNavigate } from "react-router";

export default function PageNotFound() {
    const navigate = useNavigate();
    return (
        <section className="flex-center flex-col h-[80vh] justify-center items-center w-full text-heading">
            <Ghost color="#6366f1" size={80} strokeWidth={1} className="opacity-80"/>
            <p className="m-5">Oops! This page has vanished into thin air.</p>
            <button className="btn-primary m-5" onClick={()=> navigate("/",{replace:true})}>Go Back Home</button>
        </section>
        )
}