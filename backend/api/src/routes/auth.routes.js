import express from "express";
import { loginUserController, registerUserController } from "../controllers/auth.controllers.js";
import { validateBody } from "../middlewares/validationMiddleware.js";
import {registerSchema,loginSchema} from "../../../../lib/schemas/auth.validator.js"

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), registerUserController);
authRouter.post("/login",validateBody(loginSchema), loginUserController);

export default authRouter;