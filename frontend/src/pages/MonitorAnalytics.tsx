import { useParams } from "react-router"
import { useSummary } from "../features/monitors/hooks/useSummary"
import {UptimePieChart} from "../features/monitors/components/UptimePieChart";
import type { FailureSeries, ResponseSeries, SeriesType, SummaryType, UptimeSeries } from "../features/monitors/types";
import {UptimeTrendChart} from "@/features/monitors/components/UptimeTrendChart";
import {FailureCountChart} from "@/features/monitors/components/FailureCountChart";
import {ResponseTimeChart} from "@/features/monitors/components/ResponseTimeChart";
import React from "react";

export default function MonitorAnalytics() {
    
    const {id} = useParams();
    if(!id) return <p>Invalid Id</p>

    const { summary, isLoading, isFetching, error, series }: { summary: SummaryType; isLoading: boolean; isFetching: boolean; error: Error | null, series: SeriesType[]; } = useSummary(id,"7d");
    if(isLoading) return <p>Loading...</p>
    if(error) return <p>{error.message}</p>
    console.log(summary, series)
    const { upTimeSeries, responseSeries, failureSeries } = React.useMemo(() => {
        const uptime: UptimeSeries[] = [];
        const response: ResponseSeries[] = [];
        const failure: FailureSeries[] = [];

        series?.forEach((s) => {
            uptime.push({ timestamp: s.timestamp, uptimePercentage: s.uptimePercentage });
            response.push({ timestamp: s.timestamp, avgResponseTime: s.avgResponseTime });
            failure.push({ timestamp: s.timestamp, failureCount: s.failureCount });
        });

        return { upTimeSeries: uptime, responseSeries: response, failureSeries: failure };
    }, [series]);

    return (
        <section className="section">
            <h2 className="text-title center">Analytics</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card card-title">Uptime Percentage: {summary.uptimePercentage !==null ? summary.uptimePercentage.toFixed(2) : "UNKNOWN"}</div>
                <div className="card card-title">Average Response Time: {summary.avgResponseTime ? summary.avgResponseTime.toFixed(2) : "UNKNOWN"}</div>
                <div className="card card-title">Total Down Time: {summary?.totalDownTime}</div>
                <div className="card card-title">Failure Count: {summary?.failureCount}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {summary.uptimePercentage !==null && <UptimePieChart uptimePercentage={parseFloat(summary.uptimePercentage?.toFixed(2))}/> }
                {upTimeSeries.length > 0 && <UptimeTrendChart data={upTimeSeries}/>}
                {responseSeries.length > 0 && <ResponseTimeChart data={responseSeries}/>}
                {failureSeries.length > 0 && <FailureCountChart data={failureSeries}/>}
            </div>

            {isFetching && <p className="w-full mt-6">Refreshing...</p>}
        </section>
    )
}