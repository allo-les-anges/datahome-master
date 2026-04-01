import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 });

  try {
    const response = await fetch(url);
    const xml = await response.text();
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur de fetch' }, { status: 500 });
  }
}