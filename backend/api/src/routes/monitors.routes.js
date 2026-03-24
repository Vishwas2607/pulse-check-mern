import express from "express";
import { createMonitorController, getMonitorsController } from "../controllers/monitor.controller.js";

const monitorRouter = express.Router();

monitorRouter.post("/monitors", createMonitorController);
monitorRouter.get("/monitors", getMonitorsController);

export default monitorRouter;