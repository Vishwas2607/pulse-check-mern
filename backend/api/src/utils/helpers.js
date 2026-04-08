import jwt from "jsonwebtoken";
import AppError from "./appError.js";

export const generateAccessToken = (id) => {
    const jwtsecret = process.env.JWT_SECRET;

    if(!jwtsecret) throw new AppError(500, "Critical Error: JWT_SECRET is not defined in .env")
    const accessToken = jwt.sign({sub:id}, jwtsecret, {expiresIn:"15m"});
    return accessToken;
}