import {z} from "zod";

export const getSummaryQuerySchema = z.object({
    range: z.enum(["24h", "7d", "15d", "30d"], {message:"Only 24h, 7d, 15d, 30d are considered as allowed ranges"}).default("24h")
})

export const createMonitorSchema = z.object({
    url: z.url("Invalid url"),
    interval: z.enum(["60","90","120","300"]).default("60")
})