import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import DayProgress from '@/models/DayProgress';
import MistakeLog from '@/models/MistakeLog';
import MockScore from '@/models/MockScore';
import { DayProgressData, MockScoreData } from '@/types';

// GET all progress data from MongoDB
export async function GET() {
  try {
    await connectToDatabase();

    const [daysDocs, mistakesDocs, mockScoresDocs] = await Promise.all([
      DayProgress.find({}).lean(),
      MistakeLog.find({}).sort({ createdAt: -1 }).lean(),
      MockScore.find({}).lean(),
    ]);

    const daysData: Record<string, DayProgressData> = {};
    daysDocs.forEach((d: any) => {
      daysData[d.dayId] = {
        dayId: d.dayId,
        completed: d.completed,
        status: d.status,
        confidence: d.confidence,
        notes: d.notes,
        links: d.links || [],
        subTasks: d.subTasks || {},
        hoursLogged: d.hoursLogged || 0,
        lastUpdated: d.lastUpdated,
      };
    });

    const mockScores: Record<string, MockScoreData> = {};
    mockScoresDocs.forEach((m: any) => {
      mockScores[m.checkpointId] = {
        checkpointId: m.checkpointId,
        score: m.score,
        targetScore: m.targetScore,
        notes: m.notes,
        savedAt: m.savedAt,
      };
    });

    return NextResponse.json({
      success: true,
      daysData,
      mistakes: mistakesDocs,
      mockScores,
    });
  } catch (error: any) {
    console.error('Error fetching progress from MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST update or create a day's progress in MongoDB
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { dayId, ...updates } = body;

    if (!dayId) {
      return NextResponse.json(
        { success: false, error: 'dayId is required' },
        { status: 400 }
      );
    }

    const updatedDoc = await DayProgress.findOneAndUpdate(
      { dayId },
      {
        $set: {
          ...updates,
          dayId,
          lastUpdated: new Date(),
        },
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      day: updatedDoc,
    });
  } catch (error: any) {
    console.error('Error saving day progress to MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
