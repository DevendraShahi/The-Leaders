import mongoose, { Model, Schema, models } from "mongoose";

type IngestStatus = "success" | "partial" | "failed" | "dry-run";

interface IIngestError {
    rowNumber: number;
    message: string;
}

export interface IElectionResultIngest {
    source: string;
    fetchedAt?: Date;
    mode: "merge" | "replace";
    status: IngestStatus;
    parsedRows: number;
    acceptedRows: number;
    rejectedRows: number;
    affectedConstituencies: number;
    rowErrors: IIngestError[];
    metadata?: Record<string, unknown>;
    createdBy?: string;
    createdByEmail?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const IngestErrorSchema = new Schema<IIngestError>(
    {
        rowNumber: { type: Number, required: true },
        message: { type: String, required: true },
    },
    { _id: false }
);

const ElectionResultIngestSchema = new Schema<IElectionResultIngest>(
    {
        source: { type: String, required: true, default: "manual-ingest" },
        fetchedAt: { type: Date },
        mode: { type: String, enum: ["merge", "replace"], required: true, default: "merge" },
        status: {
            type: String,
            enum: ["success", "partial", "failed", "dry-run"],
            required: true,
        },
        parsedRows: { type: Number, required: true, default: 0 },
        acceptedRows: { type: Number, required: true, default: 0 },
        rejectedRows: { type: Number, required: true, default: 0 },
        affectedConstituencies: { type: Number, required: true, default: 0 },
        rowErrors: { type: [IngestErrorSchema], default: [] },
        metadata: { type: Schema.Types.Mixed },
        createdBy: { type: String },
        createdByEmail: { type: String },
    },
    { timestamps: true }
);

ElectionResultIngestSchema.index({ createdAt: -1 });
ElectionResultIngestSchema.index({ source: 1, createdAt: -1 });

const ElectionResultIngest: Model<IElectionResultIngest> =
    (models.ElectionResultIngest as Model<IElectionResultIngest>) ||
    mongoose.model("ElectionResultIngest", ElectionResultIngestSchema);

export default ElectionResultIngest;
