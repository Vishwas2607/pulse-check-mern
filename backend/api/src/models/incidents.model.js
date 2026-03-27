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

incidentSchema.index({monitorId:1, status:1, startedAt:1});
incidentSchema.index({monitorId:1, status:1, resolvedAt:1, startedAt:1});

export const Incident = mongoose.model("Incident", incidentSchema)