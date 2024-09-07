export const revalidate = 0;

export default async function QuestionnairePage({
  params,
}: {
  params: { slug: string };
}) {
  const questionnaireId = params.slug;
  return <>{questionnaireId}</>;
}
