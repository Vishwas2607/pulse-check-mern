import mongoose from "mongoose";

const hourlyAggregateSchema = new mongoose.Schema({
    monitorId: {
        type: String,
        required: [true, "MonitorId is required."]
    },
    bucketStart: {
        type:Date,
        required: [true, "Bucket start is required"]
    },
    totalChecks: {
        type: Number,
        required: [true, "Total checks is required."]
    },
    upChecks: {
        type: Number,
        required: [true, "Up checks is required."]
    },

    totalResponseTime: {
        type: Number,
        required:[true, "Total response time is required."]
    },

    failureCount: {
        type: Number,
        default: 0
    },

    downtime: {
        type: Number,
        default: 0
    }
})

hourlyAggregateSchema.index({monitorId:1, bucketStart:1});

export const HourlyAggregate = mongoose.model("HourlyAggregate", hourlyAggregateSchema);