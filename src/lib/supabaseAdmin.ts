/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  User,
  QuestionnaireReturn,
  QTypes,
  QuestionSchema,
  CheckQuestionnaire,
  UserWithCompletions,
  QuestionnaireResponse,
} from '@/types';
import { createClient } from '@supabase/supabase-js';

import { Database } from '@/types_db';
import getUserId from './getUserId';

const supabaseUrl = 'https://wvjwkrmeduqejllfqwms.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

const getUsersWithResponses = async (): Promise<UserWithCompletions[]> => {
  const { data, error } = await supabase
    .from('user')
    .select(
      'id, username, is_admin, user_response(response, questionnaire_junction(questionnaire_questionnaires(*), questionnaire_questions(question) ))'
    )
    .eq('is_admin', 'FALSE')
    .order('id');
  console.log(`data returned from supabase before transformation`);
  console.dir(data, { depth: null });

  if (error) {
    console.log(error.message);
  }

  // Transform the returned data into UserWithCompletions type
  const transformedData: UserWithCompletions[] = (data || []).map(
    (user: any) => {
      // Create a map to group questions by `questionnaireName`
      const questionnaireMap: {
        [key: string]: { question: string; answer: string[] }[];
      } = {};

      user.user_response.forEach((responseItem: any) => {
        const questionnaireName =
          responseItem.questionnaire_junction.questionnaire_questionnaires.name;
        const questionData =
          responseItem.questionnaire_junction.questionnaire_questions.question;

        // Parse the question if it's a JSON string
        const parsedQuestion = JSON.parse(questionData);
        const questionText = parsedQuestion.question;

        // Check if the questionnaire already exists in the map
        if (!questionnaireMap[questionnaireName]) {
          questionnaireMap[questionnaireName] = [];
        }

        // Find if the question already exists in the map, and if so, append the answer
        const existingQuestion = questionnaireMap[questionnaireName].find(
          (q) => q.question === questionText
        );

        if (existingQuestion) {
          // If the question already exists, append the answer to the array
          existingQuestion.answer.push(...responseItem.response);
        } else {
          // Otherwise, add a new entry for this question with its answer(s)
          questionnaireMap[questionnaireName].push({
            question: questionText,
            answer: responseItem.response,
          });
        }
      });

      // Convert the map into an array of QuestionnaireResponse objects
      const responses: QuestionnaireResponse[] = Object.keys(
        questionnaireMap
      ).map((key) => ({
        questionnaireName: key,
        questions: questionnaireMap[key],
      }));

      // Count the number of completed questionnaires (those with at least one response)
      const completedQuestionnaires = responses.length;

      return {
        id: user.id as number, // User ID
        username: user.username as string, // Username
        completedQuestionnaires, // Number of completed questionnaires
        responses, // Array of questionnaire responses
      };
    }
  );
  console.log(`data returned from supabase after transformation`);
  console.dir(transformedData, { depth: null });
  console.log(JSON.stringify(transformedData));
  return transformedData;
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

async function getQuestionnaires(): Promise<QuestionnaireReturn[] | null> {
  // First, join the necessary tables and gather the questionnaires, questions, and responses
  const { data, error } = await supabase
    .from('questionnaire_junction')
    .select(
      '*, questionnaire_questions(*), questionnaire_questionnaires(name), user_response(user_id, response)'
    )
    .order('questionnaire_id', { ascending: true }); // Order by questionnaire_id

  if (error) {
    console.error('Error fetching questionnaires:', error);
    return null;
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
}

async function getQuestionnairesByUserId(
  userId: number
): Promise<CheckQuestionnaire[] | null> {
  // First, join the necessary tables and gather the questionnaires, questions, and responses
  const { data, error } = await supabase
    .from('questionnaire_junction')
    .select(
      '*, questionnaire_questions(*), questionnaire_questionnaires(name), user_response(user_id, response)'
    )
    .eq('user_response.user_id', userId) // Filter based on the userID
    .in('id', [1, 4, 7]) // Filter by specific IDs to return only 3 unique questionnaires
    .order('questionnaire_id', { ascending: true }); // Order by questionnaire_id

  if (error) {
    console.error('Error fetching questionnaires:', error);
    throw error;
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
  const questionnaires: CheckQuestionnaire[] = transformedData.map(
    (item: QuestionnaireReturn) => ({
      id: item.questionnaire_id,
      title: item.questionnaire_questionnaires.name,
      isCompleted:
        item?.user_response?.length > 0 && // Check if user_response exists
        item?.user_response.some(
          (response: any) =>
            response.user_id === userId && response.response.length > 0
        ),
    })
  );
  console.dir(questionnaires);
  return questionnaires;
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
  getUsersWithResponses,
  getQuestionnaireById,
  getQuestionnaires,
  getQuestionnairesByUserId,
  postUserResponse,
};
