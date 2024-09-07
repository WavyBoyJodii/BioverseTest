'use server';

import { cookies } from 'next/headers';

export default async function setUserId(userid: number) {
  cookies().set('user', userid.toString());
}
