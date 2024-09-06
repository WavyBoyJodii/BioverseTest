import * as z from 'zod';

export interface User {
  id: number;
  username: string;
  password: string;
  isAdmin: boolean;
}

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Must Be atleast 3 characters long')
    .toLowerCase(),
  password: z.string().min(7, 'Password must be atleast 7 characters long'),
});

export type ZLoginSchema = z.infer<typeof loginSchema>;
