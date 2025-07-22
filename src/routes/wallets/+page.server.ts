import { redirect, fail } from '@sveltejs/kit';
import { type Blockchain, type Wallet, initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

export const load = async ({ locals, platform }) => {
    const session = await locals.auth();

    // 如果用户未登录，重定向到首页
    if (!session?.user || !session.user.id) {
        throw redirect(302, '/');
    }

    const circleClient = initiateUserControlledWalletsClient({
        apiKey: platform?.env.CIRCLE_API_KEY ?? '',
    });
    try {
        const circleUser = await circleClient.getUser({
            userId: session.user.id,
        });
        if (circleUser.data?.user.status === 'ENABLED') {
            const wallets = await circleClient.listWallets({
                userId: circleUser.data?.user.id || '',
            });
            return {
                wallets: wallets.data?.wallets || [],
            }
        }
        return {
            wallets: [],
        }
    } catch (error) {
        console.log('getUser error:', error);
        // 未在 circle 创建用户，先创建用户
        return {
            wallets: [],
        }
    }
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

        const circleClient = initiateUserControlledWalletsClient({
            apiKey: platform?.env.CIRCLE_API_KEY ?? '',
        });
        try {
            const circleUser = await circleClient.getUser({
                userId: session.user.id,
            });
            console.log('getUserResponse', circleUser.data);
        } catch (error) {
            console.log('getUser error:', error);
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
        const createWalletPinResponse = await circleClient.createWallet({
            // userToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoTW9kZSI6IlBJTiIsImRldmVsb3BlckVudGl0eUVudmlyb25tZW50IjoiVEVTVCIsImVudGl0eUlkIjoiYTQzOTVmZTctN2Y3Mi00MDcxLTkyMmMtMThmOWI1YzVlOTE3IiwiZXhwIjoxNzUxNjQ4MzMxLCJpYXQiOjE3NTE2NDQ3MzEsImludGVybmFsVXNlcklkIjoiOGY1ZTE3YjgtMzI4ZC01OWE5LWI0NTgtZDk1MmFhYWUxMGVmIiwiaXNzIjoiaHR0cHM6Ly9wcm9ncmFtbWFibGUtd2FsbGV0LmNpcmNsZS5jb20iLCJqdGkiOiI5MjgyZGQzNC1jMmU4LTRjNmQtOTNlMi01NGQzMzcwNWM2YjMiLCJzdWIiOiJlMTA0YTI1OC1kNTg2LTRlNTUtODhhZC1kODM3NmNmZDI2ZWEifQ.HpOMJSg33vnIp-X0n5w5ke7OEsJI1TwxHgDv6ShlMKZ6UwNzx_UH84E0NZZm_ZWnRw3PABPokvqaXUne5j4YKUkVnL6BoSBjWw7Lvhy9aZWCopqNz2bHcJ782VMQBik0LbSV7poO9w7qz8SZ1_d5HLgFY5MISjJ4Kswfn2puQNBQXG3Nmudlm6nY1HeHK7sPGTLEGVY8ibR73l-Tf6cloSlE9EHDkJ5YaJvlvTZEuYqxmlzIrmT6ZnllaIE0xn29E3PyNAFV9Gh8sfqqxae7CeH3VToNEWol9moaQt09alu0tdb4kcDIhUchHtWog17GEktOZ54VIN9QrF772o27xg',
            userToken: userSessionTokenResponse.data?.userToken || '',
            blockchains: [blockchain as Blockchain || 'ETH-SEPOLIA'],
            accountType: 'SCA',
        });
        challengeId = createWalletPinResponse.data?.challengeId || '';

        return {
            success: true,
            message: '钱包创建成功！',
            userToken: userSessionTokenResponse.data?.userToken,
            encryptionKey: userSessionTokenResponse.data?.encryptionKey,
            challengeId: challengeId,
        };
    }
};
