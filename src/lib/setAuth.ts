'use server';

import { cookies } from 'next/headers';

export default async function setAuth() {
  cookies().set('auth', 'true');
}
