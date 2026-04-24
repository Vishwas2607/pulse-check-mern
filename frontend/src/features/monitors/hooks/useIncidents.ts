import { useInfiniteQuery } from "@tanstack/react-query"
import { getIncidents} from "../api"

export const useIncidents = (id:string) => {
    return useInfiniteQuery({
        queryKey: ["incidents", id],
        queryFn: ({pageParam}) => getIncidents(id,pageParam),
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.nextCursor : undefined
        },
        refetchInterval:3*60*1000,
        staleTime:60000
    });
};
