'use server';

import { cookies } from 'next/headers';

export default async function getAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth');

  if (token?.value === 'true') {
    return true;
  } else {
    return false;
  }
}
