import { isDev } from "../utils/constants.js";
import {ZodError} from "zod";

const errorHandler = (err,req,res,next)=> {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if(err.name === "JsonWebTokenError") {
        statusCode = 403;
        message = "Forbidden"
    };

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token Expired";
    };

    if(err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation error",
            errors: err.issues?.map(issue=> ({
                path:issue.path.join("."),
                message: issue.message
            }))
        })
    }

    if(isDev){
        console.error(err.stack); 
    }else {
        console.error("[Error]: ", err.message);
    };

    res.status(statusCode).json({message: message, ...(isDev && {stack: err.stack})});

};

export default errorHandler