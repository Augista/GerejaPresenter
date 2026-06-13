import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an AI assistant for a church presentation app that generates animated motion backgrounds.

When the user describes a background they want, respond with:
1. A short, friendly message (1-2 sentences) confirming what you'll generate.
2. Animation parameters in a <params>...</params> block.

The params block must be valid JSON with this exact shape:
{
  "animationType": "gradient_flow" | "particles" | "waves" | "bokeh" | "aurora",
  "primaryColor": "#rrggbb",
  "secondaryColor": "#rrggbb",
  "accentColor": "#rrggbb",
  "speed": "slow" | "medium" | "fast",
  "brightness": "dark" | "medium" | "bright",
  "particleCount": 50,
  "description": "short filename-safe description"
}

Animation types:
- gradient_flow: smooth flowing gradient (best for peaceful/worship)
- particles: floating light particles (best for stars/holy spirit themes)
- waves: layered wave patterns (best for water/ocean themes)
- bokeh: soft glowing circles (best for candle/warm themes)
- aurora: northern lights effect (best for heavenly/night themes)

Always include the <params> block. Match colors to the described mood and theme.`;

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env' },
        { status: 500 }
      );
    }

    const contents = [
      ...(history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Could not generate a response.';

    const paramsMatch = raw.match(/<params>([\s\S]*?)<\/params>/);
    let params = null;
    if (paramsMatch) {
      try {
        params = JSON.parse(paramsMatch[1].trim());
      } catch {
        params = null;
      }
    }

    const cleanMessage = raw.replace(/<params>[\s\S]*?<\/params>/g, '').trim();

    return NextResponse.json({ message: cleanMessage, params });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
