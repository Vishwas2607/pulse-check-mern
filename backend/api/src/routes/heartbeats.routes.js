import express from "express";
import { getHeartbeatsController } from "../controllers/heartbeats.controller.js";

const heartBeatRouter = express.Router({mergeParams:true});

heartBeatRouter.get("/", getHeartbeatsController);

export default heartBeatRouter;