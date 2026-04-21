import { useParams,useNavigate, Link } from "react-router";
import type {GetLastHeartbeatType} from "@/features/monitors/types";
import {useInView} from "react-intersection-observer"
import { useEffect } from "react";
import { useHeartbeats } from "@/features/monitors/hooks/useHeartbeats";
import { HeartbeatCard } from "@/features/monitors/components/HeartbeatCard";
import { Loadable,Skeleton } from "@/components/Skeleton";

export default function Heartbeats () {
  const { id } = useParams();
  const { ref, inView } = useInView(); 
  const navigate = useNavigate();

  if(!id) return <p>Id is invalid</p>; 

  const {data,hasNextPage,fetchNextPage, isLoading, isFetchingNextPage,error} = useHeartbeats(id);
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage]);

  if(error) return <p className="text-center text-error">{error.message}</p>

  const heartbeats = (data?.pages.flatMap((page) => page.heartbeats)as GetLastHeartbeatType[]) ?? [];
  
  return (
    <section className="container-app section gap-10 px-10">
        <h2 className="text-title text-center">Heartbeats History</h2>
    <Loadable loading={isLoading} skeleton={<Skeleton className="h-20 w-full rounded-lg" childClass="top-5 right-5 w-10 h-10"/>}>
    <div className="flex-center flex-col">
      {(!heartbeats || heartbeats.length === 0) && <p className="text-center">No heartbeats to show</p>}

        <ul className="w-full flex flex-col gap-10">
          {heartbeats.map((h:GetLastHeartbeatType)=> (
            <div className="card">
            <HeartbeatCard key={h._id} _id={h._id} status={h.status} checkedAt={h.checkedAt} responseTime={h.responseTime} statusCode={h.statusCode} error={h.error}/>
            </div>
          ))}
        </ul>

        {heartbeats.length !==0 && <div ref={ref} className="h-10 w-full flex justify-center items-center">
          {isFetchingNextPage ? <p>Loading more...</p> : (hasNextPage ? "Scroll for more" : "No more heartbeats")}
        </div>}

      </div>
      </Loadable>
      <Loadable loading={isLoading} skeleton={<Skeleton className="h-20 w-full rounded-lg" childClass="top-5 right-5 w-10 h-10"/>}><div className="hidden"></div></Loadable>
      <Loadable loading={isLoading} skeleton={<Skeleton className="h-20 w-full rounded-lg" childClass="top-5 right-5 w-10 h-10"/>}><div className="hidden"></div></Loadable>

        <div className="flex-center gap-main mt-5">
          <button className="btn-secondary" onClick={()=>navigate(-1)}>Go back</button>
          <Link className="btn-primary" to={`/monitors/${id}/incidents`}>View Incidents</Link>
        </div>
    </section>
  )
}