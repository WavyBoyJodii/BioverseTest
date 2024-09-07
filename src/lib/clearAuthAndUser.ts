'use server';

import { cookies } from 'next/headers';

export default async function clearAuthCookie() {
  console.log(`logging clear auth cookie.....`);
  cookies().set('auth', '');
  cookies().set('user', '');
  console.log(`auth cookie should be cleared...`);
}
