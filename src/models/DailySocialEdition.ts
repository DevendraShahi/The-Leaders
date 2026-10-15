import mongoose, { Schema } from 'mongoose';
const schema = new Schema({
    date: { type: String, required: true }, edition: { type: String, enum: ['morning', 'evening'], required: true },
    title: { en: String, ne: String }, caption: { en: String, ne: String },
    sources: [{ _id: false, id: String, name: String, url: String, publishedAt: Date, verifiedAt: Date, support: String }],
    slides: [{ _id: false, section: String, headline: { en: String, ne: String }, body: { en: String, ne: String }, sourceIds: [String], happenedOn: String, eventDate: String, eventTime: Date, venue: String }],
    omissions: [{ _id: false, en: String, ne: String }],
    status: { type: String, enum: ['draft', 'in_review', 'ready', 'reviewed'], default: 'draft' }, reviewedBy: String, reviewedAt: Date,
    reviewInvalidatedAt: Date,
}, { timestamps: true });
schema.index({ date: 1, edition: 1 }, { unique: true });
export default mongoose.models.DailySocialEdition || mongoose.model('DailySocialEdition', schema);
