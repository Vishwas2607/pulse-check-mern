import jwt from "jsonwebtoken";
import AppError from "./appError.js";

export const generateAccessToken = (id) => {
    const jwtsecret = process.env.JWT_SECRET;

    if(!jwtsecret) throw new AppError(500, "Critical Error: JWT_SECRET is not defined in .env")
    const accessToken = jwt.sign({sub:id}, jwtsecret, {expiresIn:"15m"});
    return accessToken;
}


export const convertToDate = (range) => {
    const match = range.match(/^(\d+)([dhm])$/);
    if (!match) throw new Error("Invalid range format");

    const [, value, unit] = match;
    const duration = parseInt(value, 10);

    const date = new Date();

    if (unit === "d") date.setDate(date.getDate() - duration);
    if (unit === "h") date.setHours(date.getHours() - duration);
    if (unit === "m") date.setMinutes(date.getMinutes() - duration);

    return date;
};
