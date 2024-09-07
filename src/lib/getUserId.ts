'use server';

import { cookies } from 'next/headers';

export default async function getUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get('user');

  return token!.value;
}
