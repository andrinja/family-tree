import { createClient } from '@/utils/supabase/server';

export default async function Person() {
	const supabase = createClient();
	const { data: person } = await supabase.from("public.person").select();

	return <pre>{JSON.stringify(person, null, 2)}</pre>
}
