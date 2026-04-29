import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
})

connection.on("error", (err)=> console.error("Redis connection error:", err))

export const monitorQueue = new Queue("monitor-queue", {
    connection
})