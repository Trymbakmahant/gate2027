import mongoose, { Schema, Document, Model } from 'mongoose';
import { DayProgressData, LinkItem } from '@/types';

export interface IDayProgressDocument extends Omit<DayProgressData, 'dayId'>, Document {
  dayId: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<LinkItem>({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  url: { type: String, required: true },
  type: { type: String, default: 'reference' },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const DayProgressSchema = new Schema<IDayProgressDocument>({
  dayId: { type: String, required: true, unique: true, index: true },
  completed: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  confidence: { type: String, enum: ['G', 'Y', 'R', null], default: null },
  notes: { type: String, default: '' },
  links: { type: [LinkSchema], default: [] },
  subTasks: { type: Schema.Types.Mixed, default: {} },
  hoursLogged: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const DayProgress: Model<IDayProgressDocument> =
  mongoose.models.DayProgress || mongoose.model<IDayProgressDocument>('DayProgress', DayProgressSchema);

export default DayProgress;
