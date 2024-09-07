import * as z from 'zod';

export interface User {
  id: number;
  username: string;
  password: string;
  is_admin: boolean;
}

export const loginSchema = z.object({
  username: z.string().min(3, 'Must Be atleast 3 characters long'),
  password: z.string().min(7, 'Password must be atleast 7 characters long'),
});

export type ZLoginSchema = z.infer<typeof loginSchema>;

export enum QTypes {
  mcq = 'mcq',
  input = 'input',
}

export type QuestionSchema = {
  type: QTypes;
  options?: string[];
  question: string;
};

export type Question = {
  id: number;
  question: QuestionSchema;
};

export interface Questionnaire {
  id: number;
  title: string;
  questions: Question[];
}
