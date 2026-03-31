import { getIncidentCursorBased, getIncidentsFromDB } from "../repositories/incidents.repository.js";
import AppError from "../utils/appError.js";

export const getIncidents = async(monitorId,data) => {

    if (!monitorId) throw new AppError(400, "Invalid or no ID provided");
    if(!data.limit) data.limit = 10;

    const {cursor,limit} = data;
    let incidents;

    if (cursor) {
        const { startedAt, _id } = JSON.parse(cursor);
        incidents = await getIncidentCursorBased(monitorId,startedAt,_id,limit);
    } else {
        incidents = await getIncidentsFromDB(monitorId,limit);
    }

    if(!incidents) throw new AppError(400,"No incidents happened to show");

    const nextCursor = incidents.length ? JSON.stringify({
                startedAt: incidents[incidents.length - 1].startedAt,
                _id: incidents[incidents.length - 1]._id
                })
            : null;

    return {incidents:incidents, nextCursor: nextCursor};
}
