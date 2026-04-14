import { useParams } from "react-router-dom"
import { useSummary } from "../features/monitors/hooks/useSummary"
import UptimePieChart from "../features/monitors/components/UptimePieChart";
import type { SummaryType } from "../features/monitors/types";

export default function MonitorAnalytics() {
    const {id} = useParams();
    if(!id) return <p>Invalid Id</p>

    const { summary, isLoading, isFetching, error }: { summary: SummaryType; isLoading: boolean; isFetching: boolean; error: Error | null; } = useSummary(id);
    if(isLoading) return <p>Loading...</p>
    if(error) return <p>{error.message}</p>
    console.log(summary.uptimePercentage)
    return (
        <section className="section">
            <h2 className="text-title center">Analytics</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card card-title">Uptime Percentage: {summary.uptimePercentage !==null ? summary.uptimePercentage.toFixed(2) : "UNKNOWN"}</div>
                <div className="card card-title">Average Response Time: {summary.avgResponseTime ? summary.avgResponseTime.toFixed(2) : "UNKNOWN"}</div>
                <div className="card card-title">Total Down Time: {summary?.totalDownTime}</div>
                <div className="card card-title">Failure Count: {summary?.failureCount}</div>
            </div>

            <div>
               {summary.uptimePercentage !==null && <UptimePieChart uptimePercentage={parseFloat(summary.uptimePercentage?.toFixed(2))}/> }
            </div>
        </section>
    )
}