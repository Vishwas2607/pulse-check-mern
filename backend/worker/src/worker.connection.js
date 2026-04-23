import { Worker } from "bullmq";
import { connection } from "./config/redis.js";
import logger from "./utils/logger.js";
import monitorProcessor from "./monitor.process.js";

let worker;

export const startWorker = () => {

    if(!worker) { 
        worker = new Worker(
            "monitor-queue",
            monitorProcessor,
            {connection,
            concurrency: 20,
            }
        );

        worker.on('ready', () => {
            logger.info('✅ Worker is connected and ready to receive jobs!');
        });

        worker.on("completed", (job)=> {
            logger.info(`Job ${job.id} completed`);
        });

        worker.on("failed", (job,err)=> {
            logger.info(`failed jobId: ${job?.id}, monitorId: ${job?.data?.monitorId}, attempNumber: ${job?.attemptsMade}`)
            logger.error(err.message|| err)
        });

        worker.on("error", (err) => {
            logger.error(`Worker connection error: ${err.message}`);
        });
    };
    return worker;
}