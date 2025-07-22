
import { SvelteKitAuth } from "@auth/sveltekit"
import { D1Adapter } from "@auth/d1-adapter"
import Google from "@auth/sveltekit/providers/google"

export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => ({
    trustHost: true,
    adapter: D1Adapter(event.platform?.env?.DB),
    providers: [
        Google({ clientId: event.platform?.env.AUTH_GOOGLE_ID, clientSecret: event.platform?.env.AUTH_GOOGLE_SECRET }),
    ],
    callbacks: {
        session({ session, user }) {
            if (user) {
                session.user.id = user.id;
            }
            return session;
        },
        // redirect({ url }) {
        //     // console.log('in redirect', url, baseUrl);
        //     // 这里允许从任意位置登录
        //     // https://authjs.dev/reference/nextjs#redirect
        //     return url;
        // }
    }
}))

