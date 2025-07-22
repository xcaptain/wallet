import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
    try {
        // 获取数据库连接
        const db = platform?.env?.DB;
        if (!db) {
            console.error('Database connection not available');
            return json({ error: 'Database not available' }, { status: 500 });
        }

        // 获取请求的原始 body
        const rawBody = await request.text();
        
        // 获取请求头信息
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });
        
        // 获取客户端信息
        const clientAddress = getClientAddress();
        const userAgent = request.headers.get('user-agent') || '';
        const method = request.method;

        console.log('Received wallet webhook:', {
            method,
            clientAddress,
            userAgent,
            headers: Object.keys(headers),
            bodyLength: rawBody.length
        });

        // 将完整的 webhook 数据存储到数据库
        const result = await db
            .prepare(`
                INSERT INTO webhook_logs (
                    webhook_type,
                    raw_body,
                    headers,
                    method,
                    ip_address,
                    user_agent,
                    status,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `)
            .bind(
                'wallet',
                rawBody,
                JSON.stringify(headers),
                method,
                clientAddress,
                userAgent,
                'pending'
            )
            .run();

        console.log('Webhook data saved to database:', {
            success: result.success,
            rowId: result.meta?.last_row_id
        });

        // 尝试解析 JSON 以进行基本验证
        let parsedBody;
        try {
            parsedBody = JSON.parse(rawBody);
            console.log('Webhook body parsed successfully:', {
                type: typeof parsedBody,
                keys: Object.keys(parsedBody || {})
            });
        } catch (parseError) {
            console.warn('Webhook body is not valid JSON:', parseError);
            // 即使不是 JSON 也继续处理，因为我们已经存储了原始数据
        }

        // 返回成功响应
        return json({ 
            success: true, 
            message: 'Webhook received and stored',
            logId: result.meta?.last_row_id
        }, { 
            status: 200 
        });

    } catch (error) {
        console.error('Error processing wallet webhook:', error);
        
        // 尝试记录错误到数据库
        try {
            const db = platform?.env?.DB;
            if (db) {
                await db
                    .prepare(`
                        INSERT INTO webhook_logs (
                            webhook_type,
                            raw_body,
                            method,
                            ip_address,
                            user_agent,
                            status,
                            error_message,
                            created_at,
                            updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                    `)
                    .bind(
                        'wallet',
                        'Error occurred before body could be read',
                        'POST',
                        getClientAddress(),
                        request.headers.get('user-agent') || '',
                        'failed',
                        error instanceof Error ? error.message : 'Unknown error'
                    )
                    .run();
            }
        } catch (dbError) {
            console.error('Failed to log error to database:', dbError);
        }

        return json({ 
            error: 'Internal server error',
            message: 'Failed to process webhook'
        }, { 
            status: 500 
        });
    }
};

// 可选：支持 GET 请求用于健康检查
export const GET: RequestHandler = async () => {
    return json({ 
        status: 'ok', 
        service: 'wallet webhook endpoint',
        timestamp: new Date().toISOString()
    });
};
