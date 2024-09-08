/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  User,
  Questionnaire,
  QuestionnaireReturn,
  QTypes,
  QuestionSchema,
} from '@/types';
import { createClient } from '@supabase/supabase-js';

import { Database } from '@/types_db';
import getUserId from './getUserId';

const supabaseUrl = 'https://wvjwkrmeduqejllfqwms.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const getUserById = async (): Promise<User> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('user')
    .select('id, username, is_admin')
    .eq('id', userId)
    .single();

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('user').select('*').order('id');
  console.log(`data returned from supabase ${JSON.stringify(data)}`);

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

const getQuestionnaireById = async (
  id: string
): Promise<QuestionnaireReturn[]> => {
  const { data, error } = await supabase
    .from('questionnaire_junction')
    .select(
      '*, questionnaire_questions(*), questionnaire_questionnaires(name), user_response(user_id, response)'
    )
    .eq('questionnaire_id', id)
    .order('priority', { ascending: false });

  console.log(
    `logging getQuestionnaireById data return ${JSON.stringify(data)}`
  );

  if (error) {
    console.log(error.message);
  }

  // Ensure we properly transform the jsonb data into our TypeScript types
  const transformedData: QuestionnaireReturn[] = (data || []).map(
    (item: any) => {
      const questionData: QuestionSchema = JSON.parse(
        item.questionnaire_questions.question
      );

      return {
        id: item.id as number, // Cast to number
        priority: item.priority as number, // Cast to number
        question_id: item.question_id as number, // Cast to number
        questionnaire_id: item.questionnaire_id as number, // Cast to number
        questionnaire_questions: {
          id: item.questionnaire_questions.id as number, // Cast to number
          question: {
            type: questionData.type as QTypes, // Cast to your QTypes enum
            options: questionData.options || [], // Cast options to array (string[])
            question: questionData.question as string, // Cast to string
            response:
              item.user_response?.map((response: any) => ({
                user_id: response.user_id as number, // Cast to number
                response: response.response as string[], // Cast to string array
              })) || [], // Ensure an empty array if no responses
          },
        },
        questionnaire_questionnaires: {
          name: item.questionnaire_questionnaires.name as string, // Cast to string
        },
        user_response:
          item.user_response?.map((response: any) => ({
            user_id: response.user_id as number, // Cast to number
            response: response.response as string[], // Cast to string array
          })) || [], // Ensure an empty array if no responses
      };
    }
  );
  console.dir(transformedData, { depth: null });

  return transformedData;
};

async function getQuestionnaires(): Promise<Questionnaire[] | null> {
  // First, join the necessary tables and gather the questionnaires, questions, and responses
  const { data, error } = await supabase
    .from('questionnaire_junction')
    .select(
      `*,
      questionnaire_questionnaires(name),
      questionnaire_questions(question),
      user_responses(*)
    `
    )
    .order('questionnaire_id', { ascending: true }); // Order by questionnaire_id

  if (error) {
    console.error('Error fetching questionnaires:', error);
    return null;
  }

  return (data as any) || [];
}

async function getQuestionnairesByUserId(
  userID: string
): Promise<Questionnaire[] | null> {
  // First, join the necessary tables and gather the questionnaires, questions, and responses
  const { data, error } = await supabase
    .from('questionnaire_junction')
    .select(
      `*,
      questionnaire_questionnaires(name),
      questionnaire_questions(question),
      user_responses(*)
    `
    )
    .eq('user_responses.user_id', userID) // Filter based on the userID
    .order('questionnaire_id', { ascending: true }); // Order by questionnaire_id

  if (error) {
    console.error('Error fetching questionnaires:', error);
    return null;
  }

  return (data as any) || [];
}

const postUserResponse = async (
  userId: number,
  junctionId: number,
  response: string[]
) => {
  const { error: supabaseError } = await supabase.from('user_response').insert([
    {
      user_id: userId,
      questionnaire_junction_id: junctionId,
      response: response,
    },
  ]);
  if (supabaseError) throw supabaseError;
  console.log(`user response submitted junction id ${junctionId}`);
};

export {
  getUserById,
  getUsers,
  getQuestionnaireById,
  getQuestionnaires,
  getQuestionnairesByUserId,
  postUserResponse,
};
