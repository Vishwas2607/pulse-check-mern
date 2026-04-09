import Monitor from "../models/monitors.model.JS";
import { getOneMonitorFromDB } from "../repositories/monitors.repository.js";
import AppError from "../utils/appError.js";

const verifyMonitorOwnership = async (req, res, next) => {
  const monitor = await getOneMonitorFromDB(req.user,req.monitor);
  
  if(!monitor) return next(new AppError(403, "Forbidden"));
  req.monitor = monitor;
  next();
}

export default verifyMonitorOwnership