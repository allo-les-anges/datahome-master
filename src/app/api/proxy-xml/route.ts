// src/app/api/proxy-xml/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ✅ Domaines autorisés
const ALLOWED_DOMAINS = ['medianewbuild.com', 'habihub.com'];

function isUrlAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
  }

  // ✅ Sécurité : vérifier que l'URL est autorisée
  if (!isUrlAllowed(url)) {
    console.warn(`[SECURITY] Tentative d'accès refusée: ${url}`);
    return NextResponse.json({ error: 'Domaine non autorisé' }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000), // Timeout 30s
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}` }, { status: response.status });
    }
    
    const xml = await response.text();
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Proxy XML error:', error);
    return NextResponse.json({ error: 'Erreur de fetch' }, { status: 500 });
  }
}