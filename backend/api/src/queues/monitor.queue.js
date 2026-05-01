import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL,{
    // host: process.env.REDIS_HOST || "127.0.0.1", //Required for seperate host/port
    // port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
})

connection.on("error", (err)=> console.error("Redis connection error:", err))

export const monitorQueue = new Queue("monitor-queue", {
    connection
})