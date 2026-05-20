// ============================================================
//  Vercel Serverless Function — Gemini Receipt Proxy (FREE)
//  Same architecture as TravelSplit Tier 1
//
//  Deploy: vercel --prod
//  Set env: vercel env add GEMINI_API_KEY
//  Free tier: 1M calls/month, 10s max duration
// ============================================================

export const config = { runtime: 'edge' }; // Edge = faster, lower latency

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PROMPT = `你是一个精准的餐厅小票收据 OCR 专家。请仔细分析这张图片，执行以下任务：

1. 提取小票上所有消费菜品/单项的名称和单价。
2. 识别出小票的全局金额：Subtotal（小计）、Tax / SST（税费）、Service Charge（服务费）、Grand Total（最终实付总额）。
3. 判断价内税还是价外税：所有菜品单价之和≈Grand Total 则为价内税，isTaxInclusive=true；否则 isTaxInclusive=false。
4. 输出 JSON 结构严格为：{"isTaxInclusive":true,"subtotal":95,"tax":5,"serviceCharge":9.5,"grandTotal":109.5,"items":[{"name":"菜品名","price":38.00}]}
不要包含任何 markdown、\`\`\`json 或废话。`;

export default async function handler(req) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });
    }

    // Check server key
    if (!GEMINI_KEY) {
        return new Response(JSON.stringify({
            error: 'SERVER_KEY_MISSING',
            message: 'Server API key not configured. Set GEMINI_API_KEY env var on Vercel.'
        }), { status: 503, headers });
    }

    try {
        const body = await req.json();
        const imageBase64 = body.image || '';

        if (!imageBase64) {
            return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400, headers });
        }

        // Strip data URL prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        // Call Gemini
        const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: PROMPT },
                        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
            })
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text().catch(() => '');
            console.error('[split-receipt] Gemini error:', geminiRes.status, errText.slice(0, 300));
            return new Response(JSON.stringify({
                error: 'GEMINI_ERROR',
                status: geminiRes.status,
                message: errText.slice(0, 500)
            }), { status: 502, headers });
        }

        const data = await geminiRes.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON — direct + regex fallback
        let result;
        try {
            result = JSON.parse(rawText.trim());
        } catch {
            const match = rawText.match(/\{[\s\S]*\}/);
            if (!match) {
                return new Response(JSON.stringify({
                    error: 'PARSE_FAILED',
                    raw: rawText.slice(0, 300)
                }), { status: 422, headers });
            }
            result = JSON.parse(match[0]);
        }

        return new Response(JSON.stringify(result), { status: 200, headers });

    } catch (err) {
        console.error('[split-receipt] Unexpected error:', err.message);
        return new Response(JSON.stringify({
            error: 'INTERNAL_ERROR',
            message: err.message
        }), { status: 500, headers });
    }
}
