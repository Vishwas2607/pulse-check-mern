import Monitor from "../models/monitors.model.JS";
import AppError from "../utils/appError.js";

const verifyMonitorOwnership = async (req, res, next) => {
  const monitor = await Monitor.findOne({_id: req.params.id, userId: req.user});
  if(!monitor) return next(new AppError(403, "Forbidden"));
  req.monitor = monitor;
  next();
}

export default verifyMonitorOwnership