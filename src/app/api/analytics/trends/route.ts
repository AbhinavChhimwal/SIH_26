import { NextRequest, NextResponse } from 'next/server';
import { extractTrendsFromPosts } from '@/lib/services/trendService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const posts = body.posts || [];

    if (!Array.isArray(posts)) {
      return NextResponse.json({ error: 'Field "posts" must be an array.' }, { status: 400 });
    }

    const trends = extractTrendsFromPosts(posts);
    return NextResponse.json({ success: true, trends });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
