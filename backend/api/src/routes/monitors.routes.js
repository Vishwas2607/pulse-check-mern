import express from "express";
import { createMonitorController, deleteMonitorController, getMonitorsController, getMonitorStatusController, getSummaryController, updateMonitorController } from "../controllers/monitors.controller.js";
import heartBeatRouter from "./heartbeats.routes.js";
import incidentRouter from "./incidents.routes.js";
import verifyMonitorOwnership from "../middlewares/monitorOwnershipMiddleware.js";

const monitorRouter = express.Router();

monitorRouter.post("/", createMonitorController);
monitorRouter.get("/", getMonitorsController);
monitorRouter.patch("/:id",verifyMonitorOwnership,updateMonitorController);
monitorRouter.delete("/:id", verifyMonitorOwnership, deleteMonitorController);
monitorRouter.get("/:id/status",verifyMonitorOwnership, getMonitorStatusController);
monitorRouter.get("/:id/summary",verifyMonitorOwnership, getSummaryController);
monitorRouter.use("/:id/heartbeats",verifyMonitorOwnership, heartBeatRouter);
monitorRouter.use("/:id/incidents",verifyMonitorOwnership, incidentRouter);

export default monitorRouter;