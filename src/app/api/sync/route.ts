import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import DayProgress from '@/models/DayProgress';
import MistakeLog from '@/models/MistakeLog';
import MockScore from '@/models/MockScore';
import { MistakeLogData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { daysData, errorLogs, mockScores } = body;

    // Bulk upsert daysData
    if (daysData && typeof daysData === 'object') {
      const ops = Object.keys(daysData).map((dayId) => ({
        updateOne: {
          filter: { dayId },
          update: { $set: { ...daysData[dayId], dayId, lastUpdated: new Date() } },
          upsert: true,
        },
      }));
      if (ops.length > 0) {
        await DayProgress.bulkWrite(ops as any);
      }
    }

    // Bulk upsert errorLogs
    if (Array.isArray(errorLogs) && errorLogs.length > 0) {
      const errOps = errorLogs.map((err: MistakeLogData) => ({
        updateOne: {
          filter: { id: err.id },
          update: { $set: err },
          upsert: true,
        },
      }));
      await MistakeLog.bulkWrite(errOps as any);
    }

    // Bulk upsert mockScores
    if (mockScores && typeof mockScores === 'object') {
      const mockOps = Object.keys(mockScores).map((checkpointId) => ({
        updateOne: {
          filter: { checkpointId },
          update: { $set: { ...mockScores[checkpointId], checkpointId, savedAt: new Date() } },
          upsert: true,
        },
      }));
      if (mockOps.length > 0) {
        await MockScore.bulkWrite(mockOps as any);
      }
    }

    return NextResponse.json({ success: true, message: 'Data synced successfully to MongoDB' });
  } catch (error: any) {
    console.error('Error syncing to MongoDB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
