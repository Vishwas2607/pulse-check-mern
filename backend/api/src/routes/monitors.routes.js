import express from "express";
import { createMonitorController, deleteMonitorController, getMonitorsController, getMonitorStatusController, getSummaryController, updateMonitorController } from "../controllers/monitors.controller.js";
import heartBeatRouter from "./heartbeats.routes.js";
import incidentRouter from "./incidents.routes.js";
import verifyMonitorOwnership from "../middlewares/monitorOwnershipMiddleware.js";
import { validateBody, validateQuery } from "../middlewares/validationMiddleware.js";
import { createMonitorSchema, getSummaryQuerySchema } from "../../../../lib/schemas/monitor.validator.js";

const monitorRouter = express.Router();

monitorRouter.post("/",validateBody(createMonitorSchema), createMonitorController);
monitorRouter.get("/", getMonitorsController);
monitorRouter.get("/:id",verifyMonitorOwnership,getMonitorStatusController);
monitorRouter.patch("/:id",verifyMonitorOwnership,updateMonitorController);
monitorRouter.delete("/:id", verifyMonitorOwnership, deleteMonitorController);
monitorRouter.get("/:id/summary",verifyMonitorOwnership,validateQuery(getSummaryQuerySchema), getSummaryController);
monitorRouter.use("/:id/heartbeats",verifyMonitorOwnership, heartBeatRouter);
monitorRouter.use("/:id/incidents",verifyMonitorOwnership, incidentRouter);

export default monitorRouter;