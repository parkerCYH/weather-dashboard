import { redis } from '@/lib/redis';
import { env } from '@/env';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 驗證 CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = authHeader?.replace('Bearer ', '');

    if (cronSecret !== env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 執行一個簡單的 Redis 操作來喚醒 Upstash
    const timestamp = new Date().toISOString();
    const key = 'keep-alive:last-ping';
    
    await redis.set(key, timestamp);
    const lastPing = await redis.get(key);

    // 返回成功響應
    return NextResponse.json({
      success: true,
      message: 'Upstash Redis keep-alive ping successful',
      timestamp,
      lastPing,
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
