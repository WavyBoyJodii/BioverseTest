import * as z from 'zod';

export interface User {
  id: number;
  username: string;
  password: string;
  is_admin: boolean;
}

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Must Be atleast 3 characters long')
    .toLowerCase(),
  password: z.string().min(4, 'Password must be atleast 4 characters long'),
});

export type ZLoginSchema = z.infer<typeof loginSchema>;

export enum QTypes {
  mcq = 'mcq',
  input = 'input',
}

export type ResponseSchema = {
  user_id: number;
  response: string[];
};

export type QuestionSchema = {
  type: QTypes;
  options?: string[];
  question: string;
  response: ResponseSchema[];
};

export type Question = {
  id: number;
  question: QuestionSchema;
};

export interface Questionnaire {
  name: string;
}

export interface QuestionnaireReturn {
  id: number;
  priority: number;
  question_id: number;
  questionnaire_id: number;
  questionnaire_questions: Question;
  questionnaire_questionnaires: Questionnaire;
  user_response: ResponseSchema[];
}

export type QuestionnaireFormData = {
  [key: string]: string | string[];
};

export interface CheckQuestionnaire {
  id: number;
  title: string;
  isCompleted: boolean;
}

export interface QuestionnaireResponse {
  questionnaireName: string;
  questions: { question: string; answer: string[] }[];
}

export interface UserWithCompletions {
  id: number;
  username: string;
  password: string;
  is_admin: boolean;
  completedQuestionnaires: number;
  responses: QuestionnaireResponse[];
  questionnaires: CheckQuestionnaire[];
}
