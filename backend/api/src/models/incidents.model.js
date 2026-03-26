import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
    monitorId: String,
    status: {
        type: String,
        enum: ["open", "resolved"],
        default: "open"
    },
    startedAt: Date,
    resolvedAt: {
        type: Date,
        default: null,
    },
});

export const Incident = mongoose.model("Incident", incidentSchema)