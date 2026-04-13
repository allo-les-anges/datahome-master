// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protéger toutes les routes admin
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  
  if (isAdminRoute) {
    const adminSecret = process.env.ADMIN_API_SECRET;
    const authHeader = request.headers.get('x-admin-secret');
    
    // Si aucune clé secrète n'est configurée, bloquer par sécurité
    if (!adminSecret) {
      console.error('❌ ADMIN_API_SECRET non configuré dans .env.local');
      return new NextResponse('Configuration error', { status: 500 });
    }
    
    // Vérifier le secret
    if (authHeader !== adminSecret) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};