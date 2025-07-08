import { redirect, fail } from '@sveltejs/kit';
import { type Blockchain, type Wallet, initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

export const load = async ({ locals, platform }) => {
    const session = await locals.auth();

    const circleClient = initiateUserControlledWalletsClient({
        apiKey: platform?.env.CIRCLE_API_KEY ?? '',
        headers: {
            'Host': 'api.circle.com',
        }
    });

    const res = await fetch('https://api.circle.com/v1/w3s/users/fcae144a-c8c0-4778-a4c8-0d0a5c7fbcbd', {
        headers: {
            'Authorization': `Bearer ${platform?.env.CIRCLE_API_KEY ?? ''}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
    console.log('Circle API response:', platform?.env.CIRCLE_API_KEY.length, platform?.env.CIRCLE_API_KEY.slice(40, 78), res.status, await res.json());

    // 如果用户未登录，重定向到首页
    if (!session?.user || !session.user.id) {
        throw redirect(302, '/');
    }

    // TODO: 从数据库或 Circle API 获取用户的钱包列表
    // 目前返回空列表
    const sql = "select * from wallets where user_id = ? order by created_at desc";
    const rawWalletsResult = await platform?.env.DB.prepare(sql).bind(session.user.id).all();
    const rawWallets = rawWalletsResult?.results || [];

    // transform raw wallets to Wallet type
    const wallets: Wallet[] = rawWallets.map((wallet) => ({
        id: wallet.id as string,
        userId: wallet.user_id as string,
        blockchain: wallet.blockchain as Blockchain,
        address: wallet.address as string,
        custodyType: wallet.custody_type as 'ENDUSER' | 'DEVELOPER',
        state: wallet.state as 'LIVE' | 'FROZEN',
        walletSetId: wallet.wallet_set_id as string,
        createDate: new Date(wallet.created_at as string).toISOString(),
        updateDate: new Date(wallet.updated_at as string).toISOString(),
    }));


    return {
        wallets,
    };
};

export const actions = {
    create: async ({ request, locals, platform }) => {
        const session = await locals.auth();

        // 检查用户是否已登录
        if (!session?.user || !session.user.id) {
            throw redirect(302, '/');
        }

        const data = await request.formData();
        const blockchain = data.get('blockchain')?.toString();

        // 确保区块链还未创建，一个用户只能在一条链上创建一个钱包
        const existingWallets = await platform?.env.DB.prepare(
            "SELECT * FROM wallets WHERE user_id = ?"
        ).bind(session.user.id).all();
        if (existingWallets?.results.some(wallet => wallet.blockchain === blockchain)) {
            return fail(400, {
                message: '您已经在此区块链上创建了钱包，请勿重复创建！'
            });
        }

        const circleClient = initiateUserControlledWalletsClient({
            apiKey: platform?.env.CIRCLE_API_KEY ?? '',
        });
        console.log('circle client apikey', platform?.env.CIRCLE_API_KEY.slice(48, 78));
        const circleUser = await circleClient.getUser({
            userId: session.user.id,
        });
        console.log('getUserResponse', circleUser.data);
        // circleUser.data?.user
        if (!circleUser.data?.user?.id) {
            // 未在 circle 创建用户，先创建用户
            await circleClient.createUser({
                userId: session.user.id,
            });
        }

        // // 得到一个未设置PIN的user Id (uuid 格式)
        // const circleUserId = createUserResponse.data?.id;
        // const circleUserId = 'e104a258-d586-4e55-88ad-d8376cfd26ea';
        const circleUserId = session.user.id; // 此时已经创建好 circle 用户

        // acquire session token
        const userSessionTokenResponse = await circleClient.createUserToken({
            userId: circleUserId,
        });
        // {
        //     userToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoTW9kZSI6IlBJTiIsImRldmVsb3BlckVudGl0eUVudmlyb25tZW50IjoiVEVTVCIsImVudGl0eUlkIjoiYTQzOTVmZTctN2Y3Mi00MDcxLTkyMmMtMThmOWI1YzVlOTE3IiwiZXhwIjoxNzUxNjQ4MzMxLCJpYXQiOjE3NTE2NDQ3MzEsImludGVybmFsVXNlcklkIjoiOGY1ZTE3YjgtMzI4ZC01OWE5LWI0NTgtZDk1MmFhYWUxMGVmIiwiaXNzIjoiaHR0cHM6Ly9wcm9ncmFtbWFibGUtd2FsbGV0LmNpcmNsZS5jb20iLCJqdGkiOiI5MjgyZGQzNC1jMmU4LTRjNmQtOTNlMi01NGQzMzcwNWM2YjMiLCJzdWIiOiJlMTA0YTI1OC1kNTg2LTRlNTUtODhhZC1kODM3NmNmZDI2ZWEifQ.HpOMJSg33vnIp-X0n5w5ke7OEsJI1TwxHgDv6ShlMKZ6UwNzx_UH84E0NZZm_ZWnRw3PABPokvqaXUne5j4YKUkVnL6BoSBjWw7Lvhy9aZWCopqNz2bHcJ782VMQBik0LbSV7poO9w7qz8SZ1_d5HLgFY5MISjJ4Kswfn2puQNBQXG3Nmudlm6nY1HeHK7sPGTLEGVY8ibR73l-Tf6cloSlE9EHDkJ5YaJvlvTZEuYqxmlzIrmT6ZnllaIE0xn29E3PyNAFV9Gh8sfqqxae7CeH3VToNEWol9moaQt09alu0tdb4kcDIhUchHtWog17GEktOZ54VIN9QrF772o27xg',
        //     encryptionKey: 'CbftHw7A9MVAa3hpV8Ef3NgE6RsDsSdixIdC0aJHdNE='
        // }
        console.log('userSessionTokenResponse', userSessionTokenResponse.data);
        // console.log('createUserResponse', createUserResponse);

        let challengeId = '';
        if (existingWallets?.results && existingWallets?.results.length > 0) {
            // 已经有钱包，肯定有PIN
            const createWalletResponse = await circleClient.createWallet({
                // userToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoTW9kZSI6IlBJTiIsImRldmVsb3BlckVudGl0eUVudmlyb25tZW50IjoiVEVTVCIsImVudGl0eUlkIjoiYTQzOTVmZTctN2Y3Mi00MDcxLTkyMmMtMThmOWI1YzVlOTE3IiwiZXhwIjoxNzUxNjQ4MzMxLCJpYXQiOjE3NTE2NDQ3MzEsImludGVybmFsVXNlcklkIjoiOGY1ZTE3YjgtMzI4ZC01OWE5LWI0NTgtZDk1MmFhYWUxMGVmIiwiaXNzIjoiaHR0cHM6Ly9wcm9ncmFtbWFibGUtd2FsbGV0LmNpcmNsZS5jb20iLCJqdGkiOiI5MjgyZGQzNC1jMmU4LTRjNmQtOTNlMi01NGQzMzcwNWM2YjMiLCJzdWIiOiJlMTA0YTI1OC1kNTg2LTRlNTUtODhhZC1kODM3NmNmZDI2ZWEifQ.HpOMJSg33vnIp-X0n5w5ke7OEsJI1TwxHgDv6ShlMKZ6UwNzx_UH84E0NZZm_ZWnRw3PABPokvqaXUne5j4YKUkVnL6BoSBjWw7Lvhy9aZWCopqNz2bHcJ782VMQBik0LbSV7poO9w7qz8SZ1_d5HLgFY5MISjJ4Kswfn2puQNBQXG3Nmudlm6nY1HeHK7sPGTLEGVY8ibR73l-Tf6cloSlE9EHDkJ5YaJvlvTZEuYqxmlzIrmT6ZnllaIE0xn29E3PyNAFV9Gh8sfqqxae7CeH3VToNEWol9moaQt09alu0tdb4kcDIhUchHtWog17GEktOZ54VIN9QrF772o27xg',
                userToken: userSessionTokenResponse.data?.userToken || '',
                blockchains: [blockchain as Blockchain || 'ETH-SEPOLIA'],
                accountType: 'SCA',
            });
            challengeId = createWalletResponse.data?.challengeId || '';
        } else {
            const createWalletPinResponse = await circleClient.createUserPinWithWallets({
                // userToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoTW9kZSI6IlBJTiIsImRldmVsb3BlckVudGl0eUVudmlyb25tZW50IjoiVEVTVCIsImVudGl0eUlkIjoiYTQzOTVmZTctN2Y3Mi00MDcxLTkyMmMtMThmOWI1YzVlOTE3IiwiZXhwIjoxNzUxNjQ4MzMxLCJpYXQiOjE3NTE2NDQ3MzEsImludGVybmFsVXNlcklkIjoiOGY1ZTE3YjgtMzI4ZC01OWE5LWI0NTgtZDk1MmFhYWUxMGVmIiwiaXNzIjoiaHR0cHM6Ly9wcm9ncmFtbWFibGUtd2FsbGV0LmNpcmNsZS5jb20iLCJqdGkiOiI5MjgyZGQzNC1jMmU4LTRjNmQtOTNlMi01NGQzMzcwNWM2YjMiLCJzdWIiOiJlMTA0YTI1OC1kNTg2LTRlNTUtODhhZC1kODM3NmNmZDI2ZWEifQ.HpOMJSg33vnIp-X0n5w5ke7OEsJI1TwxHgDv6ShlMKZ6UwNzx_UH84E0NZZm_ZWnRw3PABPokvqaXUne5j4YKUkVnL6BoSBjWw7Lvhy9aZWCopqNz2bHcJ782VMQBik0LbSV7poO9w7qz8SZ1_d5HLgFY5MISjJ4Kswfn2puQNBQXG3Nmudlm6nY1HeHK7sPGTLEGVY8ibR73l-Tf6cloSlE9EHDkJ5YaJvlvTZEuYqxmlzIrmT6ZnllaIE0xn29E3PyNAFV9Gh8sfqqxae7CeH3VToNEWol9moaQt09alu0tdb4kcDIhUchHtWog17GEktOZ54VIN9QrF772o27xg',
                userToken: userSessionTokenResponse.data?.userToken || '',
                blockchains: [blockchain as Blockchain || 'ETH-SEPOLIA'],
                accountType: 'SCA',
            });
            challengeId = createWalletPinResponse.data?.challengeId || '';
        }

        return {
            success: true,
            message: '钱包创建成功！',
            userToken: userSessionTokenResponse.data?.userToken,
            encryptionKey: userSessionTokenResponse.data?.encryptionKey,
            challengeId: challengeId,
        };
    }
};
