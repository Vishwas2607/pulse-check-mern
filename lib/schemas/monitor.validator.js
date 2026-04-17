import {z} from "zod";

export const getSummaryQuerySchema = z.object({
    range: z.enum(["24h", "7d", "15d", "30d"], {message:"Only 24h, 7d, 15d, 30d are considered as allowed ranges"}).default("24h")
})