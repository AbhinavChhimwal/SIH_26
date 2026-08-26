import { NextRequest } from 'next/server';
import { generateNextLiveStreamPost } from '@/lib/services/ingestionService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection ACK
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to Sentix Live Stream' })}\n\n`)
      );

      // Emit a live packet every 2.5 seconds
      const interval = setInterval(() => {
        try {
          const post = generateNextLiveStreamPost();
          controller.enqueue(
            encoder.encode(`event: post\ndata: ${JSON.stringify(post)}\n\n`)
          );
        } catch (e) {
          clearInterval(interval);
          controller.close();
        }
      }, 2500);

      // Clean up on cancel
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
