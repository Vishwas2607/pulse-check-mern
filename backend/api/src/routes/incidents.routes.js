import express from "express";
import { getIncidentController } from "../controllers/incidents.controller.js";

const incidentRouter = express.Router({mergeParams:true});

incidentRouter.get("/",getIncidentController);

export default incidentRouter