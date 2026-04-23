import dotenv from "dotenv";
import ConnectDB from "../../api/src/config/db.connection.js";
import path from "path";
import logger from "./utils/logger.js";
import { startWorker } from "./worker.connection.js";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

if(process.env.NODE_ENV !== "test") {
    ConnectDB()
    .then(()=> {
        logger.info("✅ DB connected successfully");
        startWorker();
    }).catch((err)=> {
        logger.error({err},"❌ Failed to connect to DB")
        process.exit(1);
})
};