import { getHeartbeatsFromDB } from "../repositories/heartbeats.repository.js";
import AppError from "../utils/appError.js";


export const getHeartbeats = async (id,data) => {

    console.log(id)
    if (!id) throw new AppError(400, "Invalid or no ID provided");
    if(!data.page)data.page = 1;
    if(!data.limit) data.limit = 10;

    const {page,limit} = data;
    const skip = (page-1) * limit;

    const heartbeats = await getHeartbeatsFromDB(id,skip, limit);
    if(!heartbeats || heartbeats.length === 0) throw new AppError(400, "No heartbeats yet")
    return heartbeats
}