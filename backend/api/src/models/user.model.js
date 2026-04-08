import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: [3, "Username must be at least 3 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: true,
        match: [/.+@.+\..+/, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
    },
    role: {
        type:String,
        enum: ["user"],
        default: "user"
    }},
    {timestamps:true}
);

const User = mongoose.model("User", userSchema);

export default User;