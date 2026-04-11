import express from "express";
import { getHeartbeatsController, getLastHeartbeatController } from "../controllers/heartbeats.controller.js";

const heartBeatRouter = express.Router({mergeParams:true});

heartBeatRouter.get("/", getHeartbeatsController);
heartBeatRouter.get("/recent-heartbeat", getLastHeartbeatController);

export default heartBeatRouter;