import { getIncidentCursorBased} from "../repositories/incidents.repository.js";
import AppError from "../utils/appError.js";

export const getIncidents = async(monitorId,data) => {

    if (!monitorId) throw new AppError(400, "Invalid or no ID provided");

    const {cursor} = data;
    let query = {monitorId:monitorId};

    if (cursor) {
        const { startedAt, _id } = JSON.parse(cursor);
        query.$or = [
            {startedAt: {$lt: new Date(startedAt)}},
            {startedAt: new Date(startedAt), _id: {$lt: _id}}
        ]
    }
    const incidents = await getIncidentCursorBased(query,20);

    if(!incidents) throw new AppError(400,"No incidents happened to show");

    const nextCursor = incidents.length ? JSON.stringify({
                startedAt: incidents[incidents.length - 1].startedAt,
                _id: incidents[incidents.length - 1]._id
                })
            : null;

            console.log(nextCursor);

    return {incidents:incidents, nextCursor: nextCursor};
}
