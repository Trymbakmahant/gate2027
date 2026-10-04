import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MistakeLog from '@/models/MistakeLog';

// GET all mistakes
export async function GET() {
  try {
    await connectToDatabase();
    const mistakes = await MistakeLog.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, mistakes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST new mistake
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const newMistake = await MistakeLog.create({
      id: body.id || 'err_' + Date.now(),
      date: body.date || new Date().toISOString().split('T')[0],
      question: body.question,
      topic: body.topic,
      subject: body.subject || 'General',
      errorType: body.errorType || 'Concept',
      reason: body.reason || '',
      actionTaken: body.actionTaken || '',
      referenceUrl: body.referenceUrl || '',
      resolved: false,
    });

    return NextResponse.json({ success: true, mistake: newMistake });
  } catch (error: any) {
    console.error('Error creating mistake in MongoDB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update existing mistake
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const updated = await MistakeLog.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ success: true, mistake: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE mistake
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id query param is required' }, { status: 400 });
    }

    await MistakeLog.deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
