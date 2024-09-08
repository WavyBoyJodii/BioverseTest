import QuestionnairePage from '@/components/questionnaire-page';
import { getUserById } from '@/lib/supabaseAdmin';

export const revalidate = 0;

export default async function Questionnaire({
  params,
}: {
  params: { slug: string };
}) {
  const questionnaireId = params.slug;
  const user = await getUserById();
  return (
    <>
      <QuestionnairePage questionnaireId={questionnaireId} user={user} />
    </>
  );
}
