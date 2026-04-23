import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Returns a signed upload URL so the browser can upload directly to Supabase,
// bypassing Vercel's 4.5MB serverless payload limit.
export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: 'filePath is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('agencies')
      .createSignedUploadUrl(filePath);

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('agencies')
      .getPublicUrl(filePath);

    return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, publicUrl });
  } catch (error: any) {
    console.error('Signed URL error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
