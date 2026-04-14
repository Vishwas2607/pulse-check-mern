import { useQuery } from "@tanstack/react-query"
import { getMonitorSummary} from "../api"

export const useSummary = (id:string) => {
    const query = useQuery({
        queryKey: ["summary", id],
        queryFn: () => getMonitorSummary(id),
        refetchInterval:10000,
        staleTime:5000
    })

    return {data: query.data, summary: query.data ,isLoading: query.isLoading,error: query.error, isFetching: query.isFetching}
}