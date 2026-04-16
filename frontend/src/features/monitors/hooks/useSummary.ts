import { useQuery } from "@tanstack/react-query"
import { getMonitorSummary} from "../api"

export const useSummary = (id:string,inpQuery:string) => {
    const query = useQuery({
        queryKey: ["summary", id],
        queryFn: () => getMonitorSummary(id,inpQuery),
        refetchInterval:60000,
        staleTime:10000
    })

    return {data: query.data, summary: query.data?.summary, series:query.data?.series ,isLoading: query.isLoading,error: query.error, isFetching: query.isFetching}
}