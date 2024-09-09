// Type guard function
export default function isValidQuestion(question: any): question is {
  questionnaire_id: number;
  questionnaire_questionnaires: { name: string };
} {
  return (
    question.questionnaire_id !== undefined &&
    question.questionnaire_questionnaires !== null &&
    typeof question.questionnaire_questionnaires.name === 'string'
  );
}
