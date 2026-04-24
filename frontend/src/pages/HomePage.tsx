import { useAuthentication } from "@/features/auth/context/AuthenticationContext"
import {MonitorCheck, Activity, AlertOctagon, BarChart3} from "lucide-react"
import { Link } from "react-router-dom"

export default function Home() {
    const{authenticatedDetails} = useAuthentication();
    const isAuthenticated = authenticatedDetails.authenticated === "authenticated";

    return (
        <section className="section container-main">
            <div className="section-tight text-hero flex flex-col gap-2 md:gap-3 ">
                <h1>Monitor your APIs and websites with real-time uptime tracking</h1>
                <p className="text-body">Get alerts when your services go down</p>
                <div className="flex gap-main">
                    <Link to={isAuthenticated ? "/monitors": "/register"} className="btn-primary">Get Started</Link>
                    <Link to={isAuthenticated ? "/monitors": "/login"} className="btn-secondary">Login</Link>
                </div>
            </div>

            <div className="column-flex mb-10">
                <h3 className="text-title">Features</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-main">
                    <div className="card card-title hover:-translate-y-0.5 flex flex-center gap-6"><MonitorCheck/> <span>Uptime Monitoring</span></div>
                    <div className="card card-title hover:-translate-y-0.5 flex flex-center gap-6 "><Activity/> <span>Real-Time Status</span></div>
                    <div className="card card-title hover:-translate-y-0.5 flex flex-center gap-6"><AlertOctagon/> <span>Incident Tracking</span></div>
                    <div className="card card-title hover:-translate-y-0.5 flex flex-center gap-6"><BarChart3/> <span>Performance Insights</span></div>
                </div>
            </div>

            
            <div className="body-text column-flex ">
                <p className="heading">Built with queue-based architecture (Redis + Workers) for scalable monitoring.</p>
                <p>Start monitoring in seconds</p>
                <Link to={isAuthenticated ? "/monitors" : "/register"} className="btn-primary w-fit">Get Started</Link>
            </div>
        </section>
    )
}