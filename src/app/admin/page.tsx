'use server';

import AdminPanel from '@/components/admin-panel';
import { getUserById } from '@/lib/supabaseAdmin';

export default async function Admin() {
  const user = await getUserById();
  return <AdminPanel user={user} />;
}
