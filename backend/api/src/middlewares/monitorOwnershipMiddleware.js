import { getOneMonitorFromDB } from "../repositories/monitors.repository.js";
import AppError from "../utils/appError.js";

const verifyMonitorOwnership = async (req, res, next) => {
  console.log(req.params.id)
  const monitor = await getOneMonitorFromDB(req.user,req.params.id);
  
  if(!monitor) return next(new AppError(403, "Forbidden"));
  req.monitor = monitor._id;
  next();
}

export default verifyMonitorOwnership