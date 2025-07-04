import { redirect } from '@sveltejs/kit';

interface Wallet {
    id: string;
    name: string;
    address: string;
    balance: string;
    currency: string;
    createdAt: string;
}

export const load = async (event: any) => {
    const session = await event.locals.auth();
    
    // 如果用户未登录，重定向到首页
    if (!session?.user) {
        throw redirect(302, '/');
    }

    // TODO: 从数据库或 Circle API 获取用户的钱包列表
    // 目前返回空列表
    const wallets: Wallet[] = [];

    return {
        wallets
    };
};
