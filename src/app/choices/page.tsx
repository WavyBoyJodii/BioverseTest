import QuestionnaireChoice from '@/components/questionnaire-choice';
import { getUserById } from '@/lib/supabaseAdmin';

export default async function Choices() {
  const user = await getUserById();
  return <QuestionnaireChoice user={user} />;
}
