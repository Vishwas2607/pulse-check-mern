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

incidentSchema.index({monitorId:1, status:1, startedAt:1},
    {
        partialFilterExpression: {
            status: "open"
        }
    }
);
incidentSchema.index({ monitorId: 1, startedAt: -1, _id: -1 });

export const Incident = mongoose.model("Incident", incidentSchema)