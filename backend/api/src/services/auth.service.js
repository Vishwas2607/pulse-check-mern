import { createUser, findByEmail, findById } from "../repositories/user.repository.js";
import AppError from "../utils/appError.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/helpers.js";

export const registerUser = async (data) => {
    const {username,email,password} = data;

    if(!username || !email || !password) {
        // Zod will handle this better but still double check
        throw new AppError(400,"All fields are required")
    }

    const existingUser = await findByEmail(email.toLowerCase());
    if (existingUser) throw new AppError(400, "If an account exists with this email, you’ll receive instructions") 

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({username,email,password: hashedPassword });

    return {username: newUser.username, email:newUser.email};
}

export const loginUser = async (data) => {
    const {email,password} = data;

    if(!email || !password) {
        // Zod will handle this better but still double check
        throw new AppError(400,"All fields are required")
    }

    const user = await findByEmail(email.toLowerCase());

    if(!user) throw new AppError(401,"Invalid email or password");

    const isMatch = await bcrypt.compare(password,user.password);

    if(isMatch) {
        const accessToken = generateAccessToken(user._id);
        return {accessToken, username:user.username, email:user.email};
    } else{
        throw new AppError(401,"Unauthorized");
    }
}

export const authMe = async(id) => {
    const user = await findById(id);

    if(!user) throw new AppError(404, "User not found");

    return {username: user.username}
}