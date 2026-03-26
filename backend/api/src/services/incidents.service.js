import { getIncidentsFromDB } from "../repositories/incidents.repository.js";
import AppError from "../utils/appError.js";

export const getIncidents = async(id,data) => {

    if (!id) throw new AppError(400, "Invalid or no ID provided");
    if(!data.page)data.page = 1;
    if(!data.limit) data.limit = 10;

    const {page,limit} = data;
    const skip = (page-1) * limit;

    const incidents = await getIncidentsFromDB(id,skip,limit);

    if(!incidents || incidents.length === 0) throw new AppError(400,"No incidents happened to show")
    return incidents;
}
