import { useMonitors } from "../features/monitors/hooks/useMonitor";
import type { MonitorsType } from "../features/monitors/types";

export default function Monitors () {
    const {monitors, isLoading,error,isFetching} = useMonitors();

    if (isLoading) return <p>Loading...</p>
    if(error) return <p>Something went wrong</p>
    if (!monitors || monitors.length === 0) return <p>No monitors found</p>
    if (monitors) {
        return (
            <section>
                {monitors.map((m:MonitorsType)=> (
                    <ul>
                        {monitors.map((m: MonitorsType) => (
                        <li key={m.id}>
                            <span>Url: {m.url}</span> | <span>Interval: {m.interval}s</span>
                            <span>Status: {m.status}</span>
                        </li>
                        ))}
                    </ul>
                ))}

                {isFetching && <p>Refreshing...</p>}
            </section>
        )
    }

}