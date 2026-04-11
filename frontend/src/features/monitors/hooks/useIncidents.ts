import { useQuery } from "@tanstack/react-query"
import { getIncidents} from "../api"

export const useIncidents = (id:string) => {
    const query = useQuery({
        queryKey: ["incidents", id],
        queryFn: () => getIncidents(id),
        refetchInterval: 10000,
        staleTime: 5000
    })

    return {data: query.data, incidents: query.data?.incidents ?? [], nextCursor: query.data?.nextCursor ,isLoading: query.isLoading,error: query.error, isFetching: query.isFetching}
}