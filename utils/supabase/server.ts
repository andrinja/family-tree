import { Database } from '@/database.types';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

export const createClient = () => {
	const cookieStore = cookies();

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (url === undefined || key === undefined) {
		throw new Error(`Some supabase values are missing: ${JSON.stringify({url, key})}`);
	}

	return createServerClient<Database>(url, key, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({name, value, options}) => {
						cookieStore.set(name, value, options);
					});
				} catch (error) {
					// The `set` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	});
};
