// ============================================================
//  Vercel Edge Function — Receipt Scanner via AI SDK
//  Model: gemini-2.5-flash (FREE tier: 1,500 req/day)
//  Env:   GOOGLE_GENERATIVE_AI_API_KEY (auto-read by SDK)
// ============================================================

import { generateText } from 'ai';
import '@ai-sdk/google'; // Registers the 'google/' model prefix

const PROMPT = `你是一个精准的餐厅小票收据 OCR 专家。请仔细分析这张图片，执行以下任务：

1. 提取小票上所有消费菜品/单项的名称和单价。
2. 识别出小票的全局金额：Subtotal（小计）、Tax / SST（税费）、Service Charge（服务费）、Grand Total（最终实付总额）。
3. 判断价内税还是价外税：所有菜品单价之和≈Grand Total 则为价内税，isTaxInclusive=true；否则 isTaxInclusive=false。
4. 输出 JSON 结构严格为：{"isTaxInclusive":true,"subtotal":95,"tax":5,"serviceCharge":9.5,"grandTotal":109.5,"items":[{"name":"菜品名","price":38.00}]}
不要包含任何 markdown、\`\`\`json 或废话。`;

export async function POST(req) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const { image } = await req.json();
        if (!image) return Response.json({ error: 'No image' }, { status: 400, headers });

        const base64 = image.replace(/^data:image\/\w+;base64,/, '');

        const { text } = await generateText({
            model: 'google/gemini-2.5-flash',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: PROMPT },
                    { type: 'file', data: Buffer.from(base64, 'base64'), mediaType: 'image/jpeg' },
                ],
            }],
        });

        // Parse JSON (direct + regex fallback)
        let result;
        try { result = JSON.parse(text.trim()); } catch {
            const m = text.match(/\{[\s\S]*\}/);
            if (!m) return Response.json({ error: 'PARSE_FAILED', raw: text.slice(0, 200) }, { status: 422, headers });
            result = JSON.parse(m[0]);
        }

        return Response.json(result, { status: 200, headers });

    } catch (err) {
        console.error('[split-receipt]', err.message);
        return Response.json({ error: 'SCAN_FAILED', message: err.message }, { status: 500, headers });
    }
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
