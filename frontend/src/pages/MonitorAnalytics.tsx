import { useParams,Link } from "react-router"
import { useSummary } from "../features/monitors/hooks/useSummary"
import {UptimePieChart} from "../features/monitors/components/UptimePieChart";
import { type RangeType, type FailureSeries, type ResponseSeries, type SeriesType, type SummaryType, type UptimeSeries } from "../features/monitors/types";
import {UptimeTrendChart} from "@/features/monitors/components/UptimeTrendChart";
import {FailureCountChart} from "@/features/monitors/components/FailureCountChart";
import {ResponseTimeChart} from "@/features/monitors/components/ResponseTimeChart";
import React, { useState } from "react";
import { Loadable, Skeleton } from "@/components/Skeleton";

export default function MonitorAnalytics() {
    
    const {id} = useParams();
    const [range,setRange] = useState<RangeType>("24h")
    const { summary, isLoading, isFetching, error, series }: { summary: SummaryType; isLoading: boolean; isFetching: boolean; error: Error | null, series: SeriesType[]; } = useSummary(id||"",range);

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

    if(!id) return <p>Invalid Id</p>
    if(error) return <p className="text-center text-error">{error.message}</p>
    return (
        <section className="container-main flex flex-col gap-10 mx-auto">
            <h2 className="text-title text-center">Analytics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Loadable loading={isLoading} skeleton={<Skeleton childClass="hidden" className="h-15 rounded-lg w-full max-w-7xl"/>}> <div className="card card-title">Uptime Percentage: {(summary?.uptimePercentage !==null && summary?.uptimePercentage !== undefined) ? summary.uptimePercentage?.toFixed(2) : "UNKNOWN"}</div> </Loadable>
                <Loadable loading={isLoading} skeleton={<Skeleton childClass="hidden" className="h-15 rounded-lg w-full max-w-7xl"/>}> <div className="card card-title">Average Response Time: {summary?.avgResponseTime ? summary.avgResponseTime?.toFixed(2) : "UNKNOWN"}</div> </Loadable>
                <Loadable loading={isLoading} skeleton={<Skeleton childClass="hidden" className="h-15 rounded-lg w-full max-w-7xl"/>}> <div className="card card-title">Total Down Time (in mins): {Math.ceil((summary?.totalDownTime || 0)/60)}</div> </Loadable>
                <Loadable loading={isLoading} skeleton={<Skeleton childClass="hidden" className="h-15 rounded-lg w-full max-w-7xl"/>}> <div className="card card-title">Failure Count: {summary?.failureCount}</div> </Loadable>
            </div>
            
            <Loadable loading={isLoading} skeleton={<Skeleton childClass="hidden" className="h-10 rounded-lg w-45 max-w-7xl"/>}>
            {summary && (
                <div>
                <label htmlFor="range" className="label mr-2">Select Range: </label>
                <select name="range" id="range" className="select w-fit" value={range} onChange={(e:React.ChangeEvent<HTMLSelectElement>)=>setRange(e.target.value as RangeType)}>
                    <option value="24h" className="option">24 Hour</option>
                    <option value="7d" className="option">7 Days</option>
                    <option value="15d" className="option">15 Days</option>
                    <option value="30d" className="option">30 Days</option>
                </select>
                </div>
            )}
            </Loadable>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Loadable loading={isLoading} skeleton={<Skeleton childClass="w-full h-18 bottom-0 left-0" className="h-100 lg:h-110 rounded-xl w-full max-w-7xl"/>}>
                    {(summary?.uptimePercentage !==null && summary?.uptimePercentage !== undefined) && <UptimePieChart uptimePercentage={parseFloat(summary.uptimePercentage?.toFixed(2))} range={range}/> }
               </Loadable>

               <Loadable loading={isLoading} skeleton={<Skeleton childClass="w-full h-13 bottom-0 left-0" className="h-100 lg:h-110 rounded-xl w-full max-w-7xl"/>}>
                    {upTimeSeries.length > 0 && <UptimeTrendChart data={upTimeSeries} range={range}/>}
                </Loadable>

                <Loadable loading={isLoading} skeleton={<Skeleton childClass="w-full h-13 bottom-0 left-0" className="h-100 lg:h-110 rounded-xl w-full max-w-7xl"/>}>
                    {responseSeries.length > 0 && <ResponseTimeChart data={responseSeries} range={range}/>}
                </Loadable>

                <Loadable loading={isLoading} skeleton={<Skeleton childClass="w-full h-13"  className="h-100 lg:h-110 rounded-xl w-full max-w-7xl"/>}>
                    {failureSeries.length > 0 && <FailureCountChart data={failureSeries} range={range}/>}
                </Loadable>
            </div>

            {summary && summary.avgResponseTime !==0 && <p className="text-center">No data found for this period. Try adjusting your date range.</p>}

            <div className="flex-center gap-main">
                <Link to={`/monitors/${id}/heartbeats`} className="btn-primary">View Heartbeats</Link>
                <Link to={`/monitors/${id}/incidents`}className="btn-primary">View Incidents</Link>
            </div>
            {isFetching && <p className="w-full mt-6">Refreshing...</p>}
        </section>
    )
}