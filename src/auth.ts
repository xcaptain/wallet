 
import { SvelteKitAuth } from "@auth/sveltekit"
import { D1Adapter } from "@auth/d1-adapter"
import Google from "@auth/sveltekit/providers/google"
 
export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => ({
    trustHost: true,
    adapter: D1Adapter(event.platform?.env?.DB),
    providers: [
        Google({ clientId: event.platform?.env.AUTH_GOOGLE_ID, clientSecret: event.platform?.env.AUTH_GOOGLE_SECRET }),
    ],
}))
