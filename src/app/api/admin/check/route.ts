// src/app/api/admin/check/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('x-admin-secret');
  const adminSecret = process.env.ADMIN_API_SECRET;
  
  if (!adminSecret) {
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }
  
  if (authHeader !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({ success: true });
}