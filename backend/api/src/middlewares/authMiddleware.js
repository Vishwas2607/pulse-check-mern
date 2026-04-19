import jwt from "jsonwebtoken";

const authMiddleware = async(req,res,next) => {

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