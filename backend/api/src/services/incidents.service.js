import { getIncidentCursorBased} from "../repositories/incidents.repository.js";
import AppError from "../utils/appError.js";

export const getIncidents = async(monitorId,data) => {

    if (!monitorId) throw new AppError(400, "Invalid or no ID provided");

    const {cursor} = data;
    let query = {monitorId:monitorId};

    if (cursor) {
        let data
        try {
            data = cursor ? JSON.parse(cursor) : {}; 
            if(data.startedAt && data._id) {
                query.$or = [
                    {startedAt: {$lt: new Date(data.startedAt)}},
                    {startedAt: new Date(data.startedAt), _id: {$lt: data._id}}
                ]
            }
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            data = {};
        };

    }
    const incidents = await getIncidentCursorBased(query,20) || [];

    const nextCursor = incidents.length ? JSON.stringify({
                startedAt: incidents[incidents.length - 1].startedAt,
                _id: incidents[incidents.length - 1]._id
                })
            : null;

            console.log(nextCursor);

    let now = Date.now();

    const formattedIncidents = incidents.map(i => {
            const start = new Date(i.startedAt).getTime();
            const end = i.resolvedAt
                ? new Date(i.resolvedAt).getTime()
                : now;

            return {
                ...i,
                isActive: !i.resolvedAt,
                durationInSeconds: Math.max(0, Math.floor((end - start) / 1000)),
                currentStatus: !i.resolvedAt ? "DOWN" : "UP"
            };
        });

    return {incidents:formattedIncidents, nextCursor: nextCursor};
}
