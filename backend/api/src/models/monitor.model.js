import mongoose from "mongoose";

const monitorSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, "URL is required"]
    },
    interval: Number,
    },
    {
        timestamps: true,
    }
);

const Monitor = mongoose.model("Monitor", monitorSchema);

export default Monitor;

