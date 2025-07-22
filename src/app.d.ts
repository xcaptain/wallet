// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				AUTH_SECRET: string;
				AUTH_GOOGLE_ID: string;
				AUTH_GOOGLE_SECRET: string;

				CIRCLE_API_KEY: string;
				CIRCLE_APP_ID: string;
			}
		}
	}
}

export {};
