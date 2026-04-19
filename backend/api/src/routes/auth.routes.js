import express from "express";
import { loginUserController, registerUserController, authMeController, logoutController } from "../controllers/auth.controllers.js";
import { validateBody } from "../middlewares/validationMiddleware.js";
import {registerSchema,loginSchema} from "../../../../lib/schemas/auth.validator.js"
import authMiddleware from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), registerUserController);
authRouter.post("/login",validateBody(loginSchema), loginUserController);
authRouter.post("/logout", logoutController);
authRouter.get("/me", authMiddleware ,authMeController);
export default authRouter;