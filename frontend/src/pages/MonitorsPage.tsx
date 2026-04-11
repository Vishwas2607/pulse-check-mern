import { useMonitors } from "../features/monitors/hooks/useMonitor";
import type { MonitorsType } from "../features/monitors/types";
import { MonitorCard } from "../features/monitors/components/MonitorCard";

export default function Monitors () {
    const {monitors, isLoading,error,isFetching} = useMonitors();
    console.log(monitors)
    if (isLoading) return <p>Loading...</p>
    if(error) return <p>Something went wrong</p>
    if (!monitors || monitors.length === 0) return <p>No monitors found</p>
    return (
            <section className="section bg-surface">
                    <ul className="container-main flex flex-col gap-main w-full">
                        {monitors.map((m: MonitorsType) => (
                            <MonitorCard key={m._id} _id={m._id} url={m.url} interval={m.interval} status={m.status} lastIncident={m.lastIncident}/>
                        ))}
                    </ul>
                {isFetching && <p className="text-muted px-6">Refreshing...</p>}
            </section>
        )
}