import mongoose from "mongoose";

let cachedConnection = null;

export default async function ConnectDB(testUri) {

    const isTest = process.env.NODE_ENV === "test";

    if (!isTest && cachedConnection) {
        return cachedConnection;
    }

    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    try {
        const mongoURI = testUri || process.env.MONGO_URI;
        if (!mongoURI) throw new Error("Mongo URI is not defined in .env file");

        const options = {
            autoIndex: true, 
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: isTest ? 5: 20,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
        };

        const connection = await mongoose.connect(mongoURI, options)

        if(!isTest) {
            cachedConnection = connection;
        }
        
        return connection;
    } catch (err) {
        cachedConnection = null
        console.error("❌ MongoDB Connection Error:", err.message);
        throw err;
    }
}

export async function DisconnectDB() {
    await mongoose.disconnect();
    cachedConnection = null;
}