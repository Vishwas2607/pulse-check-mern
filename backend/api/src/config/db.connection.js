import mongoose from "mongoose";

export default async function ConnectDB() {
    try{
        const mongoURI = process.env.MONGO_URI;

        if(!mongoURI) throw new Error("Mongo URI is not defined in .env file");

        await mongoose.connect(mongoURI);

        console.log("✅ Connected to MongoDB")
    } catch (err) {
        throw err;
    };
};