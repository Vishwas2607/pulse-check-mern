import { useParams } from "react-router";
import { useIncidents } from "@/features/monitors/hooks/useIncidents";
import type { GetIncidentstype} from "@/features/monitors/types";
import { IncidentCard } from "@/features/monitors/components/IncidentCard";
import {useInView} from "react-intersection-observer"
import { useEffect } from "react";

export default function Incidents () {
  const { id } = useParams();
  const { ref, inView } = useInView(); 

  if(!id) return <p>Id is invalid</p>; 

  const {data,hasNextPage,fetchNextPage, isLoading, isFetchingNextPage,error} = useIncidents(id);
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage]);

  if(isLoading) return <p>Loading...</p>
  if(error) return <p>Something went Wrong</p>
  console.log(data?.pages[0].incidents)
  const incidents = (data?.pages.flatMap((page) => page.incidents)as GetIncidentstype[]) ?? [];

  if(!incidents || incidents.length === 0) return <p>Incidents not found</p>
  
  return (
    <section className="container-app section gap-10">
        <h2 className="text-title text-center">Incident History</h2>
    <div className="flex-center flex-col">
      {incidents && incidents.length === 0 && <p>No incidents to show</p>}
        <ul className="w-full flex flex-col gap-6">
          {incidents.map((i:GetIncidentstype)=> (
            <div className="card">
            <IncidentCard key={i._id} _id={i._id} startedAt={i.startedAt} resolvedAt={i.resolvedAt} status={i.status} isActive={i.isActive} durationInSeconds={i.durationInSeconds} currentStatus={i.currentStatus}/>
            </div>
          ))}
        </ul>
        <div ref={ref} className="h-10 w-full flex justify-center items-center">
          {isFetchingNextPage ? <p>Loading more...</p> : (hasNextPage ? "Scroll for more" : "No more incidents")}
        </div>
      </div>
    </section>
  )
}