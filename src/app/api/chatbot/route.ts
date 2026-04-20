import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    console.log('[Chatbot] OPENAI_API_KEY present:', !!apiKey, '| key prefix:', apiKey?.slice(0, 8));

    if (!apiKey) {
      console.error('[Chatbot] OPENAI_API_KEY is missing from process.env');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    console.log('[Chatbot] Sending request to OpenAI, messages count:', messages?.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    console.log('[Chatbot] OpenAI response status:', response.status);

    if (!response.ok) {
      const err = await response.text();
      console.error('[Chatbot] OpenAI error body:', err);
      return NextResponse.json({ error: 'OpenAI API error', detail: err, status: response.status }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('[Chatbot] Success, response length:', content.length);

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error('[Chatbot] Unexpected error:', err.message, err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
