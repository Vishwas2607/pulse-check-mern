import IORedis from "ioredis";

export const connection = new IORedis(process.env.REDIS_URL,{
  // host: process.env.REDIS_HOST || "127.0.0.1",
  // port: 6379,
  maxRetriesPerRequest: null,
});