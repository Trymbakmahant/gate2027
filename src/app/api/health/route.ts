import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    return NextResponse.json({
      status: 'connected',
      database: conn.connection.name,
      host: conn.connection.host,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API health check error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
