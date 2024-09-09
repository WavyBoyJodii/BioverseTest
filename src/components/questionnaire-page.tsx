/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QTypes, QuestionnaireReturn, User } from '@/types';
import { getQuestionnaireById, postUserResponse } from '@/lib/supabaseAdmin';
import Header from './Header';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Footer from './Footer';
import ClipLoader from 'react-spinners/ClipLoader';

interface QuestionnairePageProps {
  questionnaireId: string;
  user: User;
}
// IDs of questions that allow multiple selections
const multipleSelectionQuestionIds = [1, 4];

const createQuestionnaireSchema = (
  questionnaireData: QuestionnaireReturn[]
) => {
  const schemaShape: { [key: string]: z.ZodTypeAny } = {};

  questionnaireData.forEach((item) => {
    const q = item.questionnaire_questions;
    if (q.question.type === QTypes.input) {
      schemaShape[`question_${q.id}`] = z
        .string()
        .min(1, 'This field is required')
        .refine((value) => value.trim().length > 0, {
          message: 'Input cannot contain only whitespace',
        });
    } else if (q.question.type === QTypes.mcq) {
      if (multipleSelectionQuestionIds.includes(q.id)) {
        schemaShape[`question_${q.id}`] = z
          .array(z.string().trim())
          .min(1, 'Please select at least one option');
      } else {
        schemaShape[`question_${q.id}`] = z
          .string()
          .min(1, 'Please select an option');
      }
    }
  });

  return z.object(schemaShape);
};

const QuestionnairePage: React.FC<QuestionnairePageProps> = ({
  questionnaireId,
  user,
}) => {
  const [questionnaireData, setQuestionnaireData] = useState<
    QuestionnaireReturn[]
  >([]);
  const [formSchema, setFormSchema] = useState<z.ZodObject<any, any>>(
    z.object({})
  );
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {} as z.infer<typeof formSchema>,
  });

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      const questionnaireData = await getQuestionnaireById(
        questionnaireId,
        user.id
      );

      setQuestionnaireData(questionnaireData);
      const zodQuestionnaireSchema =
        createQuestionnaireSchema(questionnaireData);
      setFormSchema(zodQuestionnaireSchema);

      const defaultValues = questionnaireData.reduce((acc, item) => {
        const userResponse = item.user_response.find(
          (response) => response.user_id === user.id
        );
        if (userResponse) {
          acc[`question_${item.questionnaire_questions.id}`] =
            item.questionnaire_questions.question.type === QTypes.mcq &&
            multipleSelectionQuestionIds.includes(
              item.questionnaire_questions.id
            )
              ? userResponse.response
              : userResponse.response[0];
        }
        return acc;
      }, {} as z.infer<typeof formSchema>);

      reset(defaultValues);
    };

    fetchQuestionnaire();
  }, [questionnaireId, reset, user.id]);

  const onSubmit = async (data: any) => {
    try {
      for (const item of questionnaireData) {
        const questionId = item.questionnaire_questions.id;
        const response = data[`question_${questionId}`];
        await postUserResponse(
          user.id,
          item.id,
          Array.isArray(response) ? response : [response]
        );
      }
      console.log('All responses submitted successfully');
      toast(`${user.username} has successfully submitted their responses`);
      setTimeout(() => {
        router.push('/choices');
      }, 2000);
    } catch (error) {
      console.error('Error submitting responses:', error);
    }
  };

  if (questionnaireData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col">
        <Header user={user} />
        <main className="flex-grow flex items-center justify-center p-4">
          <ClipLoader color="#4f46e5" size={50} />
        </main>
        <Footer />
      </div>
    );
  }

  const questionnaireName =
    questionnaireData[0]?.questionnaire_questionnaires.name || 'Questionnaire';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col">
      <Header user={user} />

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-8">
            {questionnaireName}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {questionnaireData.map((item) => {
              const q = item.questionnaire_questions;
              return (
                <Card key={q.id} className="w-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      {q.question.question}
                    </h3>
                    {q.question.type === QTypes.input && (
                      <Controller
                        name={`question_${q.id}`}
                        control={control}
                        defaultValue={
                          item.user_response.find((r) => r.user_id === user.id)
                            ?.response[0] || ''
                        }
                        render={({ field }) => (
                          <Input {...field} className="w-full" />
                        )}
                      />
                    )}
                    {q.question.type === QTypes.mcq &&
                      q.question.options &&
                      (multipleSelectionQuestionIds.includes(q.id) ? (
                        <Controller
                          name={`question_${q.id}`}
                          control={control}
                          defaultValue={
                            item.user_response.find(
                              (r) => r.user_id === user.id
                            )?.response || []
                          }
                          render={({ field }) => (
                            <div className="space-y-2">
                              {q.question.options!.map((option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`q${q.id}-option${index}`}
                                    checked={field.value.includes(option)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...field.value,
                                          option,
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value.filter(
                                            (value: string) => value !== option
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`q${q.id}-option${index}`}>
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      ) : (
                        <Controller
                          name={`question_${q.id}`}
                          control={control}
                          defaultValue={
                            item.user_response.find(
                              (r) => r.user_id === user.id
                            )?.response[0] || ''
                          }
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              {q.question.options!.map((option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={option}
                                    id={`q${q.id}-option${index}`}
                                  />
                                  <Label htmlFor={`q${q.id}-option${index}`}>
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}
                        />
                      ))}
                    {errors[`question_${q.id}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`question_${q.id}`]?.message as string}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Submit Questionnaire
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuestionnairePage;
