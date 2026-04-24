import { useMonitors } from "../features/monitors/hooks/useMonitor";
import type { MonitorsType } from "../features/monitors/types";
import { MonitorCard } from "../features/monitors/components/MonitorCard";
import { Link } from "react-router";
import {AnimatePresence, motion} from "framer-motion"
import { Loadable, MonitorSkeleton } from "@/components/Skeleton";
import { MonitorOff } from "lucide-react"; 
import { RefreshTimer } from "@/components/RefreshTimer";
import { checkErrorMsg } from "@/utils/helpers";

export default function Monitors () {
    const {monitors, isLoading,error,isFetching} = useMonitors();

    return (
            <section className="section mt-5 flex-center">
                    <h1 className="text-title text-center">Monitors</h1>
                    <div className="flex flex-col gap-main container-main w-full lg:flex-row">
                        <Loadable loading={isLoading} skeleton={<MonitorSkeleton/>}>
                        {monitors && monitors.length > 0 && <ul className="min-w-full gap-main grid gird-cols-1 lg:grid-cols-2">
                            <AnimatePresence>
                            {monitors?.map((m: MonitorsType) => (
                                <motion.div
                                key={m._id}
                                initial={{scale:0.8, opacity:0}}
                                animate={{scale:1, opacity:1}}
                                exit={{scale:0.4,opacity:0}}
                                layout
                                >
                                <MonitorCard key={m._id} _id={m._id} url={m.url} interval={m.interval} status={m.status} lastIncident={m.lastIncident}/>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </ul>
                        }
                        {(!monitors || monitors.length===0) && (
                            <div className="flex-center flex-col w-full gap-main text-heading text-indigo-500">
                            <MonitorOff size={60} strokeWidth={1.5} className="text-indigo-500"/>
                            <p>No monitors found. Create one to start</p>
                            </div>)}
                        </Loadable>
                        <Loadable loading={isLoading} skeleton={<MonitorSkeleton/>}><div></div></Loadable>
                        
                    </div>
                    {<RefreshTimer queryKey={["monitors"]}/>}
                    {error && <p className="text-center text-error">{checkErrorMsg(error)}</p>}

                    <Link to="/add-monitor" className="btn-primary w-fit self-center">Add New Monitor</Link>
            </section>
        )
}