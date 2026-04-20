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
    error: String,
    checkKey: {
        type:String,
        required: true
    }
});


heartBeatSchema.index({monitorId:1, checkedAt:-1, _id:-1});
heartBeatSchema.index({monitorId:1, checkKey:1}, {unique:true})
export const Heartbeat = mongoose.model("Heartbeat", heartBeatSchema);