import express from "express";
import { loginUserController, registerUserController } from "../controllers/auth.controllers.js";
import { validateBody } from "../middlewares/validationMiddleware.js";
import {registerSchema,loginSchema, authMeController} from "../../../../lib/schemas/auth.validator.js"
import authMiddleware from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), registerUserController);
authRouter.post("/login",validateBody(loginSchema), loginUserController);
authRouter.get("/auth/me", authMiddleware ,authMeController);
export default authRouter;