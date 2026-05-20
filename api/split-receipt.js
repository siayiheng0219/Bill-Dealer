// ============================================================
//  Vercel Edge Function — Receipt Scanner
//  Storage: Vercel Blob (persistent receipt images)
//  AI:      Gemini 2.5 Flash (raw fetch, no SDK overhead)
//  FREE:    1.5K Gemini req/day + Vercel Blob free tier
// ============================================================

import { put } from '@vercel/blob';

const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PROMPT = `你是一个精准的餐厅小票收据 OCR 专家。请仔细分析这张图片，执行以下任务：

1. 提取小票上所有消费菜品/单项的名称和单价。
2. 识别出小票的全局金额：Subtotal（小计）、Tax / SST（税费）、Service Charge（服务费）、Grand Total（最终实付总额）。
3. 判断价内税还是价外税：所有菜品单价之和≈Grand Total 则为价内税，isTaxInclusive=true；否则 isTaxInclusive=false。
4. 输出 JSON 结构严格为：{"isTaxInclusive":true,"subtotal":95,"tax":5,"serviceCharge":9.5,"grandTotal":109.5,"items":[{"name":"菜品名","price":38.00}]}
不要包含任何 markdown、\`\`\`json 或废话。`;

const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(req) {
    try {
        const { image } = await req.json();
        if (!image) return Response.json({ error: 'No image' }, { status: 400, headers: cors });
        if (!GEMINI_KEY) return Response.json({ error: 'Server key not configured' }, { status: 503, headers: cors });

        const base64 = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64, 'base64');

        // 1. Store receipt in Vercel Blob (public, persistent)
        let blobUrl = null;
        try {
            const blob = await put(`receipts/${Date.now()}.jpg`, imageBuffer, {
                access: 'public',
                addRandomSuffix: true,
                contentType: 'image/jpeg',
            });
            blobUrl = blob.url;
        } catch (e) {
            console.warn('[split-receipt] Blob storage skipped:', e.message);
            // Non-fatal — continue without blob storage
        }

        // 2. Call Gemini for OCR
        const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: PROMPT },
                        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
                    ],
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

        // 3. Parse JSON (direct + regex fallback)
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

        // 4. Return OCR result + blob URL
        return Response.json({ ...result, blobUrl }, { status: 200, headers: cors });

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
