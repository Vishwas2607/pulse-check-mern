import { useQuery } from "@tanstack/react-query"
import { getMonitorSummary} from "../api"
import type { RangeType } from "../types"

export const useSummary = (id:string,range:RangeType) => {
    const query = useQuery({
        queryKey: ["summary", id,range],
        queryFn: () => getMonitorSummary(id,range),
        refetchInterval:60000,
        staleTime:10000
    })

    return {data: query.data, summary: query.data?.summary, series:query.data?.series ,isLoading: query.isLoading,error: query.error, isFetching: query.isFetching}
}