import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MockScore from '@/models/MockScore';

export async function GET() {
  try {
    await connectToDatabase();
    const scores = await MockScore.find({}).lean();
    return NextResponse.json({ success: true, scores });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { checkpointId, score, targetScore, notes } = body;

    if (!checkpointId) {
      return NextResponse.json({ success: false, error: 'checkpointId is required' }, { status: 400 });
    }

    const updated = await MockScore.findOneAndUpdate(
      { checkpointId },
      {
        $set: {
          score,
          targetScore,
          notes,
          savedAt: new Date(),
        },
      },
      { returnDocument: 'after', upsert: true }
    ).lean();

    return NextResponse.json({ success: true, score: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
