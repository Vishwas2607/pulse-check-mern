import { useQuery } from "@tanstack/react-query"
import { getMonitors, getMonitorStatus } from "../api"

export const useMonitors = () => {
    const query = useQuery({
        queryKey: ["monitors"],
        queryFn: getMonitors,
        refetchInterval: 10000,
        staleTime: 5000
    })

    return {data: query.data, monitors: query.data ?? [],isLoading: query.isLoading, error: query.error, isFetching: query.isFetching}
}

export const useMonitorStatus = (id:string) => {
    const query = useQuery({
        queryKey: ["monitor", id],
        queryFn: () => getMonitorStatus(id),
        refetchInterval:10000,
        staleTime: 5000
    })
    return {data: query.data, monitorStatus: query.data?.monitorStatus ?? [],isLoading: query.isLoading,error: query.error, isFetching: query.isFetching}

}