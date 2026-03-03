import { NextRequest, NextResponse } from 'next/server';
import { getDocumentDownloadUrl } from '@/lib/actions/documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getDocumentDownloadUrl(id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.redirect(result.url!);
}
