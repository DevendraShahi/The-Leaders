import mongoose, { Model, Schema, models } from "mongoose";

export interface IElectionVoteEntry {
    candidateKey: string;
    candidateId: number | null;
    sourceSerialNo: number;
    votes: number;
}

export interface IElectionVoteCount {
    constituencyKey: string;
    constituencyLabel: string;
    province: string;
    district: string;
    constituencyNumber: number | null;
    candidateVotes: IElectionVoteEntry[];
    updatedBy?: string;
    updatedByEmail?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ElectionVoteEntrySchema = new Schema<IElectionVoteEntry>(
    {
        candidateKey: { type: String, required: true },
        candidateId: { type: Number, default: null },
        sourceSerialNo: { type: Number, required: true },
        votes: { type: Number, required: true, default: 0, min: 0 },
    },
    { _id: false }
);

const ElectionVoteCountSchema = new Schema<IElectionVoteCount>(
    {
        constituencyKey: { type: String, required: true, unique: true, index: true },
        constituencyLabel: { type: String, required: true },
        province: { type: String, required: true },
        district: { type: String, required: true },
        constituencyNumber: { type: Number, default: null },
        candidateVotes: { type: [ElectionVoteEntrySchema], default: [] },
        updatedBy: { type: String },
        updatedByEmail: { type: String },
    },
    { timestamps: true }
);

ElectionVoteCountSchema.index({ province: 1, district: 1, constituencyNumber: 1 });

const ElectionVoteCount: Model<IElectionVoteCount> =
    (models.ElectionVoteCount as Model<IElectionVoteCount>) ||
    mongoose.model("ElectionVoteCount", ElectionVoteCountSchema);

export default ElectionVoteCount;
