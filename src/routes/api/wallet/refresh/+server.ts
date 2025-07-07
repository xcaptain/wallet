import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { initiateUserControlledWalletsClient, type WalletResponseDataWallet } from '@circle-fin/user-controlled-wallets';

export const GET: RequestHandler = async ({ locals, platform }) => {
    const session = await locals.auth();
    if (!session?.user || !session.user.id) {
        return json({
            status: 'error',
            message: 'User not authenticated',
            timestamp: new Date().toISOString()
        }, { status: 401 });
    }

    try {
        const circleClient = initiateUserControlledWalletsClient({
            apiKey: platform?.env.CIRCLE_API_KEY ?? '',
        });
        const circleUserWallets = await circleClient.listWallets({
            userId: session?.user?.id || '',
        });
        let circleWallets = circleUserWallets.data?.wallets || [];
        console.log('Fetched Circle wallets:', circleWallets);
        if (circleWallets.length === 0) {
            // wait 5s try again
            await new Promise(resolve => setTimeout(resolve, 5000));
            const retryCircleUserWallets = await circleClient.listWallets({
                userId: session?.user?.id || '',
            });
            circleWallets = retryCircleUserWallets.data?.wallets || [];
            console.log('Retrying Circle wallets fetch, found:', circleWallets.length);
        }
        
        const existingWallets = await platform?.env.DB.prepare(
            "SELECT * FROM wallets WHERE user_id = ?"
        ).bind(session.user.id).all();

        // 比对本地钱包列表和 circle 的结果，只处理新增的钱包
        const localWallets = existingWallets?.results || [];
        
        // 创建本地钱包ID集合，用于快速查找
        const localWalletIds = new Set(
            localWallets.map(wallet => wallet.id as string)
        );
        
        let syncedCount = 0;
        let errorCount = 0;
        
        // 只处理新钱包的插入
        for (const circleWallet of circleWallets) {
            try {
                if (!localWalletIds.has(circleWallet.id)) {
                    // 新钱包，插入到数据库
                    await platform?.env.DB.prepare(`
                        INSERT INTO wallets (
                            id, user_id, wallet_set_id, address, blockchain,
                            account_type, state, custody_type, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        circleWallet.id,
                        session.user.id,
                        circleWallet.walletSetId || null,
                        circleWallet.address,
                        circleWallet.blockchain,
                        (circleWallet.scaCore) ? 'SCA' : 'EOA', // 使用 SCA 或 EOA 作为账户类型
                        circleWallet.state,
                        circleWallet.custodyType,
                        circleWallet.createDate || new Date().toISOString(),
                        circleWallet.updateDate || new Date().toISOString()
                    ).run();
                    
                    syncedCount++;
                }
            } catch (err) {
                console.error(`Error syncing wallet ${circleWallet.id}:`, err);
                errorCount++;
            }
        }

        console.log('Wallet sync completed:', {
            total: circleWallets.length,
            local: localWallets.length,
            synced: syncedCount,
            errors: errorCount
        });

        // 返回同步结果
        return json({
            status: 'ok',
            message: 'Wallets synced successfully',
            data: {
                total: circleWallets.length,
                local: localWallets.length,
                synced: syncedCount,
                errors: errorCount
            },
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Error syncing wallets:', err);
        return json({
            status: 'error',
            message: 'Failed to sync wallets',
            error: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
};
