import mongoose from "mongoose";

let cachedConnection = null;

export default async function ConnectDB() {

    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (cachedConnection) {
            return await cachedConnection;
    }

    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) throw new Error("Mongo URI is not defined in .env file");

        const options = {
            autoIndex: true, 
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 20,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
        };

        cachedConnection = mongoose.connect(mongoURI, options);
        await cachedConnection;

        return mongoose.connection;
    } catch (err) {
        cachedConnection = null
        console.error("❌ MongoDB Connection Error:", err.message);
        throw err;
    }
}
