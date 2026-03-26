import express from "express";
import { createMonitorController, getMonitorsController, getMonitorStatusController } from "../controllers/monitors.controller.js";
import heartBeatRouter from "./heartbeats.routes.js";
import incidentRouter from "./incidents.routes.js";

const monitorRouter = express.Router();

monitorRouter.post("/", createMonitorController);
monitorRouter.get("/", getMonitorsController);
monitorRouter.get("/:id/status",getMonitorStatusController)
monitorRouter.use("/:id/heartbeats", heartBeatRouter);
monitorRouter.use("/:id/incidents",incidentRouter);

export default monitorRouter;