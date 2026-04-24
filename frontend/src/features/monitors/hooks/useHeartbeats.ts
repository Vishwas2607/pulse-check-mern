import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { getHeartbeats, getLastHeartbeat } from "../api"

export const useLastHeartbeat = (id:string) => {
    const query = useQuery({
        queryKey: ["last-heartbeat", id],
        queryFn: ()=> getLastHeartbeat(id),
        refetchInterval: 10000,
        staleTime: 5000
    })

    return {data: query.data, lastHeartbeat: query.data?.lastHeartbeat?.[0] ,isLoading: query.isLoading,error: query.error, isFetching: query.isFetching}
}

export const useHeartbeats = (id:string) => {
    return useInfiniteQuery({
        queryKey: ["heartbeats",id],
        queryFn:({pageParam}) => getHeartbeats(id,pageParam),
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.nextCursor : undefined
        },
        refetchInterval:10000,
        staleTime:5000
    });
};