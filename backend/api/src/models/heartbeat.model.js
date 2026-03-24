import mongoose from "mongoose";

const heartBeatSchema = new mongoose.Schema({
    monitorId: String,
    status: {
        type: String,
        enum: ["up", "down"],
        default: "up"
    },
    responseTime: Number,
    checkedAt: Date,
    statusCode: Number,
    error: String
});

export const Heartbeat = mongoose.model("Heartbeat", heartBeatSchema);