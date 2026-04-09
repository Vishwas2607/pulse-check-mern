import { useQuery } from "@tanstack/react-query"
import { getMonitors } from "../api"

export const useMonitors = () => {
    const query = useQuery({
        queryKey: ["monitors"],
        queryFn: getMonitors,
        refetchInterval: 10000,
        staleTime: 5000
    })

    return {data: query.data, monitors: query.data ?? [],isLoading: query.isLoading,error: query.error, isFetching: query.isFetching}
}