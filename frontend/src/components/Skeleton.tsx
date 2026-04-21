import clsx from "clsx"
import {type ReactNode } from "react"

export function Skeleton({className, childClass}:{className:string, childClass:string}) {
    return (
        <div className={clsx("relative overflow-hidden p-2 bg-gray-900", className)}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-indigo-500/10 to-transparent" />

            <div className={clsx("absolute bg-indigo-500/10 rounded", childClass)}> </div>
        </div>
    )
}

export function MonitorSkeleton() {
    return (
        <div className={clsx("relative w-full lg:w-149 h-45 overflow-hidden p-2 rounded-lg bg-gray-900")}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-indigo-500/10 to-transparent" />

            <div className={clsx("absolute w-28 h-9 bottom-7 left-4 rounded-lg bg-indigo-500/10")}> </div>
            <div className={clsx("absolute w-20 h-9 bottom-7 left-40 rounded-lg bg-indigo-500/10")}> </div>
            <div className={clsx("absolute w-20 h-10 top-5 right-5 rounded-lg bg-indigo-500/10")}> </div>
        </div>
    )
}

export function Loadable({loading,children,skeleton}: {loading:boolean,children: ReactNode, skeleton:ReactNode}) {
    return loading ? skeleton : children
}