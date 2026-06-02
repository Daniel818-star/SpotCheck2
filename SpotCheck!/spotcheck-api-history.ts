import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const analyses = await db.analysis.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formattedAnalyses = analyses.map((a) => ({
      id: a.id,
      claim: a.claim,
      category: a.category,
      result: a.result,
      confidence: a.confidence,
      isFake: a.isFake,
      explanation: a.explanation,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ analyses: formattedAnalyses });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
