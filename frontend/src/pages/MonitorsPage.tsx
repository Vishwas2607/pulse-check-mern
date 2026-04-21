import { useMonitors } from "../features/monitors/hooks/useMonitor";
import type { MonitorsType } from "../features/monitors/types";
import { MonitorCard } from "../features/monitors/components/MonitorCard";
import { Link } from "react-router";
import {AnimatePresence, motion} from "framer-motion"
import { Loadable, MonitorSkeleton } from "@/components/Skeleton";

export default function Monitors () {
    const {monitors, isLoading,error,isFetching} = useMonitors();

    return (
            <section className="section mt-5 flex-center">
                    <h1 className="text-title text-center">Monitors</h1>
                    <div className="flex flex-col gap-main container-main w-full lg:flex-row">
                        <Loadable loading={isLoading} skeleton={<MonitorSkeleton/>}>
                        {error && <p className="text-center text-error">{error.message}</p>}
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
                            {isFetching && <li className="px-6 lg:col-span-2">Refreshing...</li>}
                        </ul>
                        }
                        {(!monitors || monitors.length===0) && <p className="text-center">No monitors to show start by creating one.</p>}
                        </Loadable>
                        <Loadable loading={isLoading} skeleton={<MonitorSkeleton/>}><div></div></Loadable>
                    </div>

                    <Link to="/add-monitor" className="btn-primary w-fit self-center">Add New Monitor</Link>
            </section>
        )
}