import { useParams } from "react-router";
import type {GetLastHeartbeatType} from "@/features/monitors/types";
import {useInView} from "react-intersection-observer"
import { useEffect } from "react";
import { useHeartbeats } from "@/features/monitors/hooks/useHeartbeats";
import { HeartbeatCard } from "@/features/monitors/components/HeartbeatCard";

export default function Heartbeats () {
  const { id } = useParams();
  const { ref, inView } = useInView(); 

  if(!id) return <p>Id is invalid</p>; 

  const {data,hasNextPage,fetchNextPage, isLoading, isFetchingNextPage,error} = useHeartbeats(id);
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage]);

  if(isLoading) return <p>Loading...</p>
  if(error) return <p>Something went Wrong</p>
  console.log(data?.pages[0].heartbeats)
  const heartbeats = (data?.pages.flatMap((page) => page.heartbeats)as GetLastHeartbeatType[]) ?? [];
    console.log(heartbeats)
  if(!heartbeats || heartbeats.length === 0) return <p>No heartbeats to show</p>
  
  return (
    <section className="container-app section gap-10">
        <h2 className="text-title text-center">Heartbeats History</h2>
    <div className="flex-center flex-col">
        <ul className="w-full flex flex-col gap-6">
          {heartbeats.map((h:GetLastHeartbeatType)=> (
            <div className="card">
            <HeartbeatCard key={h._id} _id={h._id} status={h.status} checkedAt={h.checkedAt} responseTime={h.responseTime} statusCode={h.statusCode} error={h.error}/>
            </div>
          ))}
        </ul>
        <div ref={ref} className="h-10 w-full flex justify-center items-center">
          {isFetchingNextPage ? <p>Loading more...</p> : (hasNextPage ? "Scroll for more" : "No more heartbeats")}
        </div>
      </div>
    </section>
  )
}