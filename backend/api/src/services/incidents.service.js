import { getIncidentCursorBased} from "../repositories/incidents.repository.js";
import AppError from "../utils/appError.js";

export const getIncidents = async(monitorId,data) => {

    if (!monitorId) throw new AppError(400, "Invalid or no ID provided");

    const {cursor} = data;
    let query = {monitorId:monitorId};
    const limit = 20;
    if (cursor) {
        try {
            const parsedData = JSON.parse(cursor); 
            if(parsedData.startedAt && parsedData._id) {
                const parsedDataDate = new Date(parsedData.startedAt)
                query.$or = [
                    {startedAt: {$lt: parsedDataDate}},
                    {startedAt: parsedDataDate, _id: {$lt: data._id}}
                ]
            }
        } catch (e) {
            console.error("Failed to parse JSON:", e);
        };

    }
    const incidents = await getIncidentCursorBased(query,limit+1) || [];

    const hasNextPage = incidents.length > limit;
    const resultsToReturn = incidents.slice(0,limit);

    const nextCursor = hasNextPage ? JSON.stringify({
                startedAt: resultsToReturn[resultsToReturn.length - 1].startedAt,
                _id: resultsToReturn[resultsToReturn.length - 1]._id
                })
            : null;

    const now = Date.now();

    const formattedIncidents = resultsToReturn.map(i => {
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

    return {incidents:formattedIncidents, nextCursor: nextCursor, hasNextPage:hasNextPage};
}
