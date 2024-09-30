import FamilyTree from '@/components/family-tree';
import {createClient} from '@/utils/supabase/server';

const FamilyTreePage = async () => {
	const supabase = createClient();
	const {data} = await supabase.from('persons').select('*');

	if (data === null) {
		return 'No data';
	}

	return <FamilyTree data={data} />;
};

export default FamilyTreePage;
