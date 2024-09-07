/* eslint-disable @typescript-eslint/no-explicit-any */
import { User, Questionnaire } from '@/types';
import { createClient } from '@supabase/supabase-js';

import { Database } from '@/types_db';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const getUserById = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('user')
    .select('username, is_admin')
    .eq('id', id)
    .single();

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('user').select('*');

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

const getQuestionnaireById = async (id: string): Promise<Questionnaire> => {
  const { data, error } = await supabase
    .from('questionnaire_junction')
    .select('*, questionnaire_questions(*), questionnaire_questionnaires(name)')
    .eq('questionnaire_id', id)
    .order('priority', { ascending: false });

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

async function getQuestionnaires(): Promise<Questionnaire[] | null> {
  // First, join the necessary tables and gather the questionnaires, questions, and responses
  const { data, error } = await supabase
    .from('questionnaire_junction')
    .select(
      `
      questionnaire_id,
      question_id,
      priority,
      questionnaire_questionnaires(name),
      questionnaire_questions(question),
      user_responses(response, user_id)
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
      `
      questionnaire_id,
      question_id,
      priority,
      questionnaire_questionnaires(name),
      questionnaire_questions(question),
      user_responses(response)
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

export {
  getUserById,
  getUsers,
  getQuestionnaireById,
  getQuestionnaires,
  getQuestionnairesByUserId,
};
