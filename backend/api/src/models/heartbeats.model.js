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

// { monitorId: 1, checkedAt: -1 }

heartBeatSchema.index({monitorId:1, checkedAt:1});

export const Heartbeat = mongoose.model("Heartbeat", heartBeatSchema);