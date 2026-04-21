import { useParams,Link, useNavigate } from "react-router";
import { useIncidents } from "@/features/monitors/hooks/useIncidents";
import type { GetIncidentstype} from "@/features/monitors/types";
import { IncidentCard } from "@/features/monitors/components/IncidentCard";
import {useInView} from "react-intersection-observer"
import { useEffect } from "react";
import { Loadable,Skeleton } from "@/components/Skeleton";
export default function Incidents () {
  const { id } = useParams();
  const { ref, inView } = useInView(); 
  const navigate = useNavigate();

  if(!id) return <p>Id is invalid</p>; 

  const {data,hasNextPage,fetchNextPage, isLoading, isFetchingNextPage,error} = useIncidents(id);
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage]);

  if(error) return <p className="text-center text-error">{error.message}</p>

  const incidents = (data?.pages.flatMap((page) => page.incidents)as GetIncidentstype[]) ?? [];
  
  return (
    <section className="container-app section gap-10 px-10">
        <h2 className="text-title text-center">Incident History</h2>

    <Loadable loading={isLoading} skeleton={<Skeleton className="h-22 w-full rounded-lg" childClass="top-5 right-5 w-10 h-10"/>}>
    <div className="flex-center flex-col">
      {incidents && incidents.length === 0 && <p>No incidents to show</p>}

        <ul className="w-full flex flex-col gap-10">
          {incidents.map((i:GetIncidentstype)=> (
            <div className="card">
            <IncidentCard key={i._id} _id={i._id} startedAt={i.startedAt} resolvedAt={i.resolvedAt} status={i.status} isActive={i.isActive} durationInSeconds={i.durationInSeconds} currentStatus={i.currentStatus}/>
            </div>
          ))}
        </ul>

        {incidents.length !== 0 && <div ref={ref} className="h-10 w-full flex justify-center items-center mt-5">
          {isFetchingNextPage ? <p>Loading more...</p> : (hasNextPage ? "Scroll for more" : "No more incidents")}
          
        </div>}
      </div>
      </Loadable>

      <Loadable loading={isLoading} skeleton={<Skeleton className="h-22 w-full rounded-lg" childClass="top-5 right-5 w-10 h-10"/>}><div className="hidden"></div></Loadable>
      <Loadable loading={isLoading} skeleton={<Skeleton className="h-22 w-full rounded-lg" childClass="top-5 right-5 w-10 h-10"/>}><div className="hidden"></div></Loadable>
        <div className="flex-center gap-main mt-5">
          <button className="btn-secondary" onClick={()=>navigate(-1)}>Go back</button>
          <Link className="btn-primary" to={`/monitors/${id}/heartbeats`}>View Heartbeats</Link>
        </div>
    </section>
  )
}