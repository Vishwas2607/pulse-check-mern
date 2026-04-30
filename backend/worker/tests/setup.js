import 'dotenv/config';
import {MongoMemoryServer} from "mongodb-memory-server";
import ConnectDB, {DisconnectDB} from "../../shared/config/db.connection.js";
import mongoose from 'mongoose';

let mongoServer;
let connection;

export const connectTestDB = async() => {
    if(!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
    }
    
    const uri = mongoServer.getUri();
    try{
        connection = await ConnectDB(uri);
    } catch (err) {
        console.error("Test DB Connection Error",err)
        throw err;
    };
};

export const clearTestDB = async() => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany()
    }
};

export const closeTestDB = async() => {
    await DisconnectDB();
    if(mongoServer) {
        await mongoServer.stop();
    }
}