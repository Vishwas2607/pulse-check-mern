import { getLastHeartbeatFromDB, getHeartbeatCursorBased } from "../repositories/heartbeats.repository.js";
import AppError from "../utils/appError.js";


export const getHeartbeats = async (id,data) => {

    if (!id) throw new AppError(400, "Invalid or no ID provided");
    
    const {cursor} = data;

    let query = {monitorId: id};
    const limit = 20;

    if(cursor){

        try{
            const parsedCursor = JSON.parse(cursor);
            if(parsedCursor.checkedAt && parsedCursor._id){
                const cursorDate = new Date(parsedCursor.checkedAt);

                query.$or = [
                    {checkedAt: {$lt: cursorDate}},
                    {checkedAt: cursorDate, _id: {$lt: parsedCursor._id}}
                ]
            }
        } catch (err) {
            console.error("Failed to parse JSON", err);
        }
    }

    const heartbeats = await getHeartbeatCursorBased(query,limit + 1) || [];

    const hasNextPage = heartbeats.length > limit;
    const resultsToReturn = heartbeats.slice(0,limit);

    const nextCursor = hasNextPage ? JSON.stringify({
        checkedAt: resultsToReturn[resultsToReturn.length-1].checkedAt,
        _id: resultsToReturn[resultsToReturn.length -1]._id
    }) : null
    
    return {heartbeats: resultsToReturn, nextCursor: nextCursor, hasNextPage:hasNextPage};
}

export const getLastHeartbeat = async(id) => {
    if (!id) throw new AppError(400, "Invalid or no ID provided");

    const heartbeat = await getLastHeartbeatFromDB(id)||[];
    return heartbeat;
}