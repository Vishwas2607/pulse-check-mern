import {isDev} from "../utils/constants.js"

const authMiddleware = async(req,res,next) => {
    if (isDev) {
        console.warn("⚠️ DEV AUTH BYPASS ENABLED");

        req.user = "69d8a062f1d38e4f931f6899"
        return next();
    }
    const token = req.cookies?.accessToken;

    if(!token) {
        const error = new Error("Unauthorized")
        error.statusCode = 401;
        return next(error);
    };

    const jwtSecret = process.env.JWT_SECRET;

    if(!jwtSecret) {
        const error = new Error("JWT_SECRET is not defined in .env file");
        error.statusCode = 500;
        return next(error);
    };

    const user = jwt.verify(token,jwtSecret);
    req.user = user.sub;
    next();
}

export default authMiddleware;