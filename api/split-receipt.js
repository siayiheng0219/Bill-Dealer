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

const SYSTEM_PROMPT = `Extract receipt data from OCR text into JSON.

RULES:
- Items: extract only lines that have a price number. Skip sub-description lines without prices (e.g. "Sprite" under a main item).
- Merge multi-line names (e.g. "K3 Cheese" then "Ramyeon" → "Cheese Ramyeon").
- Totals: copy the EXACT number after SUBTOTAL, TAX, SERVICE CHARGE, GRANDTOTAL labels. Never calculate.
- isTaxInclusive: false if service charge or tax is listed separately.`;

const JSON_SCHEMA = '{"isTaxInclusive":false,"subtotal":0,"tax":0,"serviceCharge":0,"grandTotal":0,"items":[{"name":"EXAMPLE","price":0}]}';

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
                { role: 'user', content: `OCR Text:\n${ocrText}\n\nExtract the REAL values from the text above. Do NOT copy the example zeros — use the actual numbers found in the OCR. Return JSON in this shape: ${JSON_SCHEMA}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_tokens: 1024,
        }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(raw);
    // Normalize: flatten nested totals if present
    if (parsed.totals && !parsed.subtotal) {
        parsed.subtotal = parsed.totals.subtotal;
        parsed.tax = parsed.totals.tax;
        parsed.serviceCharge = parsed.totals.serviceCharge;
        parsed.grandTotal = parsed.totals.grandTotal;
        delete parsed.totals;
    }
    return parsed;
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
