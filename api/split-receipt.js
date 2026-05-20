// ============================================================
//  Vercel Edge Function — Receipt Scanner using Vercel AI SDK
//
//  Packages:  ai + @ai-sdk/google  (auto-installed by Vercel)
//  Env var:   GOOGLE_GENERATIVE_AI_API_KEY  (auto-read by SDK)
//  Free tier: 1.5K Gemini req/day + 1M Vercel calls/month
// ============================================================

import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';

// Same OCR prompt as TravelSplit
const PROMPT = `你是一个精准的餐厅小票收据 OCR 专家。请仔细分析这张图片，执行以下任务：

1. 提取小票上所有消费菜品/单项的名称和单价。
2. 识别出小票的全局金额：Subtotal（小计）、Tax / SST（税费）、Service Charge（服务费）、Grand Total（最终实付总额）。
3. 判断价内税还是价外税：所有菜品单价之和≈Grand Total 则为价内税，isTaxInclusive=true；否则 isTaxInclusive=false。`;

export async function POST(req) {
    // CORS
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const body = await req.json();
        const imageBase64 = body.image || '';

        if (!imageBase64) {
            return Response.json({ error: 'No image provided' }, { status: 400, headers: corsHeaders });
        }

        // Strip data URL prefix → raw base64
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        // AI SDK: generateText with structured output + image input
        const { output } = await generateText({
            model: google('gemini-2.5-flash'),
            output: Output.object({
                schema: {
                    type: 'object',
                    properties: {
                        isTaxInclusive: { type: 'boolean' },
                        subtotal:       { type: 'number' },
                        tax:            { type: 'number' },
                        serviceCharge:  { type: 'number' },
                        grandTotal:     { type: 'number' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name:  { type: 'string' },
                                    price: { type: 'number' },
                                },
                                required: ['name', 'price'],
                            },
                        },
                    },
                    required: ['items'],
                },
            }),
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: PROMPT },
                    {
                        type: 'file',
                        data: Buffer.from(cleanBase64, 'base64'),
                        mediaType: 'image/jpeg',
                    },
                ],
            }],
        });

        return Response.json(output, { status: 200, headers: corsHeaders });

    } catch (err) {
        console.error('[split-receipt] AI SDK error:', err.message);
        return Response.json(
            { error: 'SCAN_FAILED', message: err.message },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
