// ============================================================
//  Vercel Edge Function — Receipt Text → Structured JSON
//  OCR:   Tesseract.js (client-side, zero API cost)
//  AI:    Groq (primary) → OpenRouter (fallback)
//  FREE:  Groq 30 req/min + OpenRouter free models
// ============================================================

const GROQ_KEY = process.env.GROQ_API_KEY || '';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are a precise receipt parser. Given OCR-extracted text from a restaurant receipt, extract structured data.

Rules:
1. Extract every line item with its name and unit price.
2. Identify: Subtotal, Tax/SST, Service Charge, Grand Total.
3. If sum of item prices ≈ Grand Total, set isTaxInclusive=true; otherwise false.`;

const JSON_SCHEMA = '{"isTaxInclusive":true,"subtotal":95,"tax":5,"serviceCharge":9.5,"grandTotal":109.5,"items":[{"name":"Item Name","price":38.00}]}';

const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

async function callAI(url, apiKey, model, ocrText, extraHeaders = {}) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...extraHeaders,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `OCR Text:\n${ocrText}\n\nRespond with JSON matching: ${JSON_SCHEMA}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_tokens: 1024,
        }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    return JSON.parse(raw);
}

export async function POST(req) {
    try {
        const { text } = await req.json();
        if (!text || !text.trim()) return Response.json({ error: 'No OCR text provided' }, { status: 400, headers: cors });

        // ── Tier 1: Groq (fast + generous free tier) ──
        if (GROQ_KEY) {
            console.log('[split-receipt] Trying Groq...');
            try {
                const result = await callAI(GROQ_URL, GROQ_KEY, 'llama-3.1-8b-instant', text);
                if (result?.items?.length) {
                    console.log('[split-receipt] Groq SUCCESS');
                    return Response.json(result, { status: 200, headers: cors });
                }
            } catch (e) { console.warn('[split-receipt] Groq failed:', e.message); }
        }

        // ── Tier 2: OpenRouter (free models) ──
        if (OPENROUTER_KEY) {
            console.log('[split-receipt] Trying OpenRouter...');
            try {
                const result = await callAI(OPENROUTER_URL, OPENROUTER_KEY, 'meta-llama/llama-3.2-3b-instruct:free', text, {
                    'HTTP-Referer': 'https://bill-dealer.vercel.app',
                    'X-Title': 'Bill Dealer',
                });
                if (result?.items?.length) {
                    console.log('[split-receipt] OpenRouter SUCCESS');
                    return Response.json(result, { status: 200, headers: cors });
                }
            } catch (e) { console.warn('[split-receipt] OpenRouter failed:', e.message); }
        }

        // ── Both failed ──
        if (!GROQ_KEY && !OPENROUTER_KEY) {
            return Response.json({ error: 'No AI keys configured on server' }, { status: 503, headers: cors });
        }
        return Response.json({ error: 'AI_PARSE_FAILED', detail: 'All providers failed' }, { status: 502, headers: cors });

    } catch (err) {
        console.error('[split-receipt]', err.message);
        return Response.json({ error: 'SCAN_FAILED', message: err.message }, { status: 500, headers: cors });
    }
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: cors });
}
