import { NextRequest, NextResponse } from 'next/server';
import { enrichGraphWithMetrics } from '@/lib/services/networkService';
import { simulateInformationCascade } from '@/lib/services/cascadeService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawNodes = body.nodes || [];
    const rawEdges = body.edges || [];

    if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges)) {
      return NextResponse.json({ error: 'Fields "nodes" and "edges" must be arrays.' }, { status: 400 });
    }

    const { nodes, edges } = enrichGraphWithMetrics(rawNodes, rawEdges);
    const cascade = simulateInformationCascade(nodes, edges);

    return NextResponse.json({
      success: true,
      graph: {
        nodes,
        edges,
        cascadeTimeline: cascade,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
