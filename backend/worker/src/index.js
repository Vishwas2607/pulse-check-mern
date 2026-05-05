import dotenv from "dotenv";
import ConnectDB from "../../shared/config/db.connection.js";
import path from "path";
import logger from "./utils/logger.js";
import { startWorker } from "./worker.connection.js";
import express from "express";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const app = express();

app.get("/run-cron", async(req,res) => {
    const token = req.headers["x-cron-secret"];
    if(token !== process.env.CRON_SECRET){
        return res.status(403).send("Forbidden");
    }
    res.status(200).send("Ok");
});

if(process.env.NODE_ENV !== "test") {
    ConnectDB()
    .then(async()=> {
        logger.info("✅ DB connected successfully");
        
        await startWorker();
        logger.info("👷 Worker initialized and listening...");

       app.listen(10000, ()=> console.log("Worker server running..."))
    }).catch((err)=> {
        logger.error({err},"❌ Failed to connect to DB")
        process.exit(1);
})
};