import mongoose, { Schema, Document, Model } from 'mongoose';
import { MockScoreData } from '@/types';

export interface IMockScoreDocument extends MockScoreData, Document {
  createdAt: Date;
  updatedAt: Date;
}

const MockScoreSchema = new Schema<IMockScoreDocument>({
  checkpointId: { type: String, required: true, unique: true, index: true },
  score: { type: Number, required: true },
  targetScore: { type: String, default: '' },
  notes: { type: String, default: '' },
  savedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const MockScore: Model<IMockScoreDocument> =
  mongoose.models.MockScore || mongoose.model<IMockScoreDocument>('MockScore', MockScoreSchema);

export default MockScore;
