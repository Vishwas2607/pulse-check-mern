import express from "express";
import { addIncidentSeed, getIncidentController } from "../controllers/incidents.controller.js";
import {isDev} from "../utils/constants.js"

const incidentRouter = express.Router({mergeParams:true});

incidentRouter.get("/",getIncidentController);
if(isDev) incidentRouter.post("/", addIncidentSeed)

export default incidentRouter