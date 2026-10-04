import mongoose, { Schema, Document, Model } from 'mongoose';
import { MistakeLogData } from '@/types';

export interface IMistakeLogDocument extends MistakeLogData, Document {
  createdAt: Date;
  updatedAt: Date;
}

const MistakeLogSchema = new Schema<IMistakeLogDocument>({
  id: { type: String, required: true, unique: true, index: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  question: { type: String, required: true },
  topic: { type: String, required: true },
  subject: { type: String, default: 'General' },
  errorType: { type: String, default: 'Concept' },
  reason: { type: String, default: '' },
  actionTaken: { type: String, default: '' },
  referenceUrl: { type: String, default: '' },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

const MistakeLog: Model<IMistakeLogDocument> =
  mongoose.models.MistakeLog || mongoose.model<IMistakeLogDocument>('MistakeLog', MistakeLogSchema);

export default MistakeLog;
