import { redirect, fail } from '@sveltejs/kit';
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

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

export const actions = {
    create: async ({ request, locals, platform }) => {
        const session = await locals.auth();

        // 检查用户是否已登录
        if (!session?.user || !session.user.id) {
            throw redirect(302, '/');
        }

        const circleClient = initiateUserControlledWalletsClient({
            apiKey: platform?.env.CIRCLE_API_KEY ?? '',
        });
        // const createUserResponse = await circleClient.createUser({
        //     userId: session.user.id,
        // });
        // // 得到一个未设置PIN的user Id (uuid 格式)
        // const circleUserId = createUserResponse.data?.id;
        const circleUserId = 'e104a258-d586-4e55-88ad-d8376cfd26ea';

        // acquire session token
        // const userSessionTokenResponse = await circleClient.createUserToken({
        //     userId: circleUserId,
        // });
        // {
        //     userToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoTW9kZSI6IlBJTiIsImRldmVsb3BlckVudGl0eUVudmlyb25tZW50IjoiVEVTVCIsImVudGl0eUlkIjoiYTQzOTVmZTctN2Y3Mi00MDcxLTkyMmMtMThmOWI1YzVlOTE3IiwiZXhwIjoxNzUxNjQ4MzMxLCJpYXQiOjE3NTE2NDQ3MzEsImludGVybmFsVXNlcklkIjoiOGY1ZTE3YjgtMzI4ZC01OWE5LWI0NTgtZDk1MmFhYWUxMGVmIiwiaXNzIjoiaHR0cHM6Ly9wcm9ncmFtbWFibGUtd2FsbGV0LmNpcmNsZS5jb20iLCJqdGkiOiI5MjgyZGQzNC1jMmU4LTRjNmQtOTNlMi01NGQzMzcwNWM2YjMiLCJzdWIiOiJlMTA0YTI1OC1kNTg2LTRlNTUtODhhZC1kODM3NmNmZDI2ZWEifQ.HpOMJSg33vnIp-X0n5w5ke7OEsJI1TwxHgDv6ShlMKZ6UwNzx_UH84E0NZZm_ZWnRw3PABPokvqaXUne5j4YKUkVnL6BoSBjWw7Lvhy9aZWCopqNz2bHcJ782VMQBik0LbSV7poO9w7qz8SZ1_d5HLgFY5MISjJ4Kswfn2puQNBQXG3Nmudlm6nY1HeHK7sPGTLEGVY8ibR73l-Tf6cloSlE9EHDkJ5YaJvlvTZEuYqxmlzIrmT6ZnllaIE0xn29E3PyNAFV9Gh8sfqqxae7CeH3VToNEWol9moaQt09alu0tdb4kcDIhUchHtWog17GEktOZ54VIN9QrF772o27xg',
        //     encryptionKey: 'CbftHw7A9MVAa3hpV8Ef3NgE6RsDsSdixIdC0aJHdNE='
        // }
        // console.log('userSessionTokenResponse', userSessionTokenResponse);
        // console.log('createUserResponse', createUserResponse);

        const createPinResponse = await circleClient.createUserPinWithWallets({
            userToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoTW9kZSI6IlBJTiIsImRldmVsb3BlckVudGl0eUVudmlyb25tZW50IjoiVEVTVCIsImVudGl0eUlkIjoiYTQzOTVmZTctN2Y3Mi00MDcxLTkyMmMtMThmOWI1YzVlOTE3IiwiZXhwIjoxNzUxNjQ4MzMxLCJpYXQiOjE3NTE2NDQ3MzEsImludGVybmFsVXNlcklkIjoiOGY1ZTE3YjgtMzI4ZC01OWE5LWI0NTgtZDk1MmFhYWUxMGVmIiwiaXNzIjoiaHR0cHM6Ly9wcm9ncmFtbWFibGUtd2FsbGV0LmNpcmNsZS5jb20iLCJqdGkiOiI5MjgyZGQzNC1jMmU4LTRjNmQtOTNlMi01NGQzMzcwNWM2YjMiLCJzdWIiOiJlMTA0YTI1OC1kNTg2LTRlNTUtODhhZC1kODM3NmNmZDI2ZWEifQ.HpOMJSg33vnIp-X0n5w5ke7OEsJI1TwxHgDv6ShlMKZ6UwNzx_UH84E0NZZm_ZWnRw3PABPokvqaXUne5j4YKUkVnL6BoSBjWw7Lvhy9aZWCopqNz2bHcJ782VMQBik0LbSV7poO9w7qz8SZ1_d5HLgFY5MISjJ4Kswfn2puQNBQXG3Nmudlm6nY1HeHK7sPGTLEGVY8ibR73l-Tf6cloSlE9EHDkJ5YaJvlvTZEuYqxmlzIrmT6ZnllaIE0xn29E3PyNAFV9Gh8sfqqxae7CeH3VToNEWol9moaQt09alu0tdb4kcDIhUchHtWog17GEktOZ54VIN9QrF772o27xg',
            blockchains: ['ETH-SEPOLIA']
        });

        console.log('createPinResponse', createPinResponse);
        const createPinChallengeId = createPinResponse.data?.challengeId;
        const data = await request.formData();
        const walletName = data.get('walletName')?.toString();
        const blockchain = data.get('blockchain')?.toString();

        // 验证输入
        if (!walletName || walletName.trim().length === 0) {
            return fail(400, {
                error: '钱包名称不能为空',
                walletName,
                blockchain
            });
        }

        if (!blockchain) {
            return fail(400, {
                error: '请选择区块链',
                walletName,
                blockchain
            });
        }

        return {
            success: true,
            message: '钱包创建成功！',
            userToken: userSessionTokenResponse.data?.userToken,
            encryptionKey: userSessionTokenResponse.data?.encryptionKey,
            challengeId: createPinChallengeId,
        };
    }
};
