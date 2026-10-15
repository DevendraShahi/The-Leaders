import mongoose, { Schema } from "mongoose";
const schema = new Schema({ day: { type: String, required: true }, event: { type: String, required: true }, language: { type: String, enum: ["en", "ne"], required: true }, count: { type: Number, default: 0 }, expiresAt: { type: Date, required: true } });
schema.index({ day: 1, event: 1, language: 1 }, { unique: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.models.MobileMetric || mongoose.model("MobileMetric", schema);
