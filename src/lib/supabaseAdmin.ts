/* eslint-disable @typescript-eslint/no-explicit-any */
import { User, Questionnaire } from '@/types';
import { createClient } from '@supabase/supabase-js';

import { Database } from '@/types_db';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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
    .select('*, questionnaire_questions(*)')
    .eq('questionnaire_id', id)
    .order('priority', { ascending: false });

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

export { getUsers, getQuestionnaireById };
