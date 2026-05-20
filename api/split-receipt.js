// ============================================================
//  Vercel Edge Function — Receipt Text → Structured JSON
//  OCR:   Tesseract.js (client-side, zero API cost)
//  AI:    Gemini 2.5 Flash (text-only, minimal tokens)
//  FREE:  1.5K Gemini req/day — text is far cheaper than images
// ============================================================

const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PROMPT = `You are a precise receipt parser. Given the OCR-extracted text from a restaurant receipt below, extract structured data.

Rules:
1. Extract every line item with its name and unit price.
2. Identify: Subtotal, Tax/SST, Service Charge, Grand Total.
3. If sum of item prices ≈ Grand Total, set isTaxInclusive=true; otherwise false.
4. Output ONLY valid JSON — no markdown, no code fences, no commentary.

JSON schema:
{"isTaxInclusive":true,"subtotal":95,"tax":5,"serviceCharge":9.5,"grandTotal":109.5,"items":[{"name":"Item Name","price":38.00}]}

OCR Text:
`;

const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(req) {
    try {
        const { text } = await req.json();
        if (!text || !text.trim()) return Response.json({ error: 'No OCR text provided' }, { status: 400, headers: cors });
        if (!GEMINI_KEY) return Response.json({ error: 'Server key not configured' }, { status: 503, headers: cors });

        // Call Gemini with text only (much cheaper than image)
        const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: PROMPT + text }],
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
            }),
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text().catch(() => '');
            console.error('[split-receipt] Gemini error:', geminiRes.status, errText.slice(0, 300));
            return Response.json(
                { error: `Gemini ${geminiRes.status}`, detail: errText.slice(0, 200) },
                { status: 502, headers: cors }
            );
        }

        const data = await geminiRes.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON (direct + regex fallback)
        let result;
        try { result = JSON.parse(rawText.trim()); } catch {
            const m = rawText.match(/\{[\s\S]*\}/);
            if (!m) {
                return Response.json(
                    { error: 'PARSE_FAILED', raw: rawText.slice(0, 200) },
                    { status: 422, headers: cors }
                );
            }
            result = JSON.parse(m[0]);
        }

        return Response.json(result, { status: 200, headers: cors });

    } catch (err) {
        console.error('[split-receipt]', err.message);
        return Response.json(
            { error: 'SCAN_FAILED', message: err.message },
            { status: 500, headers: cors }
        );
    }
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: cors });
}
