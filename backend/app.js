import express from "express";
import helmet from "helmet";
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { isDev } from "./api/src/utils/constants.js";
import errorHandler from "./api/src/middlewares/errorHandler.js";
import monitorRouter from "./api/src/routes/monitors.routes.js";
import authRouter from "./api/src/routes/auth.routes.js";
import authMiddleware from "./api/src/middlewares/authMiddleware.js";

const app = express();
app.use(helmet());

const allowedOrigins = [process.env.CLIENT_URI].filter(Boolean);
console.log(allowedOrigins);
if(allowedOrigins.length) {
    app.use(cors({origin:allowedOrigins[0],methods:["GET","POST","PATCH","DELETE"],credentials:true}))
};

if(isDev) app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

const generalLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: isDev ? 1000: 400,
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: isDev ? 500: 200,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/auth",authLimiter);
app.use("/api", generalLimiter);

app.use("/api/monitors",authMiddleware, monitorRouter);
app.use("/api/auth", authRouter);

app.use((req,res,next)=> {
    res.status(404).json({message: "Route not found"})
})

app.use(errorHandler);

export default app;






