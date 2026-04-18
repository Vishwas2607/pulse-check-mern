import { authMe, loginUser, registerUser } from "../services/auth.service.js"
import { accessTokenOptions } from "../utils/constants.js";

export const registerUserController = async (req,res) => {
    const user = await registerUser(req.validatedBody);
    return res.status(201).json({
        message: "User registered successfully",
        data: {user: user} 
    });
}

export const loginUserController = async(req,res) => {
    const {accessToken, ...userData} = await loginUser(req.validatedBody);

    return res.cookie("accessToken", accessToken, accessTokenOptions)
    .status(200).json({message: "User successfully logged in.", data: {user:userData}});
}

export const authMeController = async(req,res) => {
    const user = await authMe(req.user);
    return res.status(200).json({authenticated:true, username: user.username});
}