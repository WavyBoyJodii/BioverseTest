import { getUsers } from './supabaseAdmin';

export const handleLogin = async (username: string, password: string) => {
  const users = await getUsers();
  // Check if user exists{{
  const user = users.find((user) => user.username === username);
  if (!user) {
    return { error: true, reason: 'No such user exists' };
  }

  // Check password
  if (user.password !== password) {
    return { error: true, reason: 'Incorrect password' };
  }

  // If both match, return success and the user object
  return { success: true, user };
};
