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
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

export const getUserByIdNew = async (): Promise<UserWithCompletions> => {
  const userId = await getUserId();

  // Fetch user data
  const { data, error } = await supabase
    .from('user')
    .select(
      '*, user_response(response, questionnaire_junction(questionnaire_questionnaires(*), questionnaire_questions(question) ))'
    )
    .eq('id', userId)
    .single(); // Fetch a single user by ID

  if (error || !data) {
    console.error('Error fetching user:', error);
    // Return null if there's an error fetching user
  }

  const userData = data as {
    id: number;
    username: string;
    password: string;
    is_admin: boolean;
    user_response?: any[];
  };

  // Create a map to group questions by `questionnaireName`
  const questionnaireMap: {
    [key: string]: { question: string; answer: string[] }[];
  } = {};

  // Process the user responses and group them by questionnaire (only if user_response exists)
  if (userData.user_response && userData.user_response.length > 0) {
    userData.user_response.forEach((responseItem: any) => {
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
  }

  // Convert the map into an array of QuestionnaireResponse objects
  const responses: QuestionnaireResponse[] = Object.keys(questionnaireMap).map(
    (key) => ({
      questionnaireName: key,
      questions: questionnaireMap[key],
    })
  );

  // Fetch user questionnaires and their completion status
  const userQuestionnaires: CheckQuestionnaire[] | null =
    await getQuestionnairesByUserId(userId);

  // placeholder for completed questionnaires, not needed for this functions purpose
  const completedQuestionnaires = 0;

  // Return a consolidated UserWithCompletions object
  return {
    id: userData.id,
    username: userData.username,
    password: userData.password, // Password (use cautiously on client-side)
    is_admin: userData.is_admin,
    completedQuestionnaires, // Number of completed questionnaires
    responses, // List of questionnaire responses
    questionnaires: userQuestionnaires!, // List of questionnaires with their completion status
  };
};

const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('user').select('*').order('id');

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

const getUsersWithResponses = async (): Promise<UserWithCompletions[]> => {
  const { data, error } = await supabase
    .from('user')
    .select(
      '*, user_response(response, questionnaire_junction(questionnaire_questionnaires(*), questionnaire_questions(question) ))'
    )
    .eq('is_admin', 'FALSE')
    .order('id');

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

      // Count the number of completed questionnaires (those with exactly 3 answered questions)
      const completedQuestionnaires = responses.filter(
        (response) => response.questions.length === 3
      ).length;

      // Fetch the user's questionnaires and determine completion status
      const questionnaires: CheckQuestionnaire[] = Object.entries(
        questionnaireMap
      ).map(([name, questions]) => ({
        id: user.user_response.find(
          (r: any) =>
            r.questionnaire_junction.questionnaire_questionnaires.name === name
        )?.questionnaire_junction.questionnaire_questionnaires.id,
        title: name,
        isCompleted: questions.length === 3, // Mark as completed if there are exactly 3 questions answered
      }));

      return {
        id: user.id as number, // User ID
        username: user.username as string, // Username
        password: user.password as string,
        is_admin: user.is_admin as boolean,
        completedQuestionnaires, // Number of completed questionnaires
        responses, // Array of questionnaire responses
        questionnaires,
      };
    }
  );
  return transformedData;
};

const getQuestionnaireById = async (
  id: string,
  userId: number
): Promise<QuestionnaireReturn[]> => {
  try {
    // Fetch the questionnaire data
    const { data: questionnaireData, error: questionnaireError } =
      await supabase
        .from('questionnaire_junction')
        .select(
          '*, questionnaire_questions(*), questionnaire_questionnaires(name)'
        )
        .eq('questionnaire_id', id)
        .order('priority', { ascending: false });

    if (questionnaireError) throw questionnaireError;

    // Fetch all user responses for this user
    const { data: allUserResponses, error: responsesError } = await supabase
      .from('user_response')
      .select('questionnaire_junction_id, response')
      .eq('user_id', userId);

    if (responsesError) throw responsesError;

    // Create a map of question_id to response
    const questionResponseMap = new Map();
    for (const response of allUserResponses) {
      const { data: junctionData } = await supabase
        .from('questionnaire_junction')
        .select('question_id')
        .eq('id', response.questionnaire_junction_id)
        .single();

      if (junctionData) {
        questionResponseMap.set(junctionData.question_id, response.response);
      }
    }

    // Transform the data
    const transformedData: QuestionnaireReturn[] = questionnaireData.map(
      (item: any) => {
        const questionData: QuestionSchema = JSON.parse(
          item.questionnaire_questions.question
        );
        const response = questionResponseMap.get(item.question_id) || [];

        return {
          id: item.id,
          priority: item.priority,
          question_id: item.question_id,
          questionnaire_id: item.questionnaire_id,
          questionnaire_questions: {
            id: item.questionnaire_questions.id,
            question: {
              type: questionData.type as QTypes,
              options: questionData.options || [],
              question: questionData.question,
              response: [
                {
                  user_id: userId,
                  response: response,
                },
              ],
            },
          },
          questionnaire_questionnaires: {
            name: item.questionnaire_questionnaires.name,
          },
          user_response: [
            {
              user_id: userId,
              response: response,
            },
          ],
        };
      }
    );

    return transformedData;
  } catch (error) {
    console.error('Error in getQuestionnaireById:', error);
    throw error;
  }
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

  return transformedData;
}

async function getQuestionnairesByUserId(
  userId: number
): Promise<CheckQuestionnaire[] | null> {
  try {
    // Fetch all questionnaires
    const { data: questionnaires, error: questionnairesError } = await supabase
      .from('questionnaire_questionnaires')
      .select('id, name')
      .order('id');

    if (questionnairesError) throw questionnairesError;

    // Fetch all questions for these questionnaires
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questionnaire_junction')
      .select('id, questionnaire_id, question_id')
      .order('questionnaire_id, priority');

    if (questionsError) throw questionsError;

    // Fetch all user responses for this user
    const { data: userResponses, error: responsesError } = await supabase
      .from('user_response')
      .select('questionnaire_junction_id, response')
      .eq('user_id', userId);

    if (responsesError) throw responsesError;

    // Create a set of answered question junction IDs
    const answeredJunctionIds = new Set(
      userResponses.map((r) => r.questionnaire_junction_id)
    );

    // Create a map of questionnaire IDs to their questions
    const questionnaireQuestions = allQuestions.reduce((acc, q) => {
      if (!acc[q.questionnaire_id]) {
        acc[q.questionnaire_id] = [];
      }
      acc[q.questionnaire_id].push(q.id);
      return acc;
    }, {} as Record<number, number[]>);

    // Determine if each questionnaire is completed
    const checkQuestionnaires: CheckQuestionnaire[] = questionnaires.map(
      (q) => ({
        id: q.id,
        title: q.name,
        isCompleted:
          questionnaireQuestions[q.id]?.every((junctionId) =>
            answeredJunctionIds.has(junctionId)
          ) ?? false,
      })
    );

    return checkQuestionnaires;
  } catch (error) {
    console.error('Error in getQuestionnairesByUserId:', error);
    throw error;
  }
}

const postUserResponse = async (
  userId: number,
  junctionId: number,
  response: string[]
) => {
  try {
    // Insert or update the response for the specific junction
    const { error: upsertError } = await supabase.from('user_response').upsert(
      {
        user_id: userId,
        questionnaire_junction_id: junctionId,
        response: response,
      },
      { onConflict: 'user_id,questionnaire_junction_id' }
    );

    if (upsertError) throw upsertError;

    console.log(`User response submitted for junction ID ${junctionId}`);
  } catch (error) {
    console.error('Error in postUserResponse:', error);
    throw error;
  }
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
