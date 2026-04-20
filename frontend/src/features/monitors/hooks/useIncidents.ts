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
    });
};
