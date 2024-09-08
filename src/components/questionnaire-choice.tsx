'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckQuestionnaire, User } from '@/types';
import { useRouter } from 'next/navigation';
import Header from './Header';
import { getQuestionnairesByUserId } from '@/lib/supabaseAdmin';
import { CheckCircle } from 'lucide-react';

interface QuestionnaireChoiceProps {
  user: User;
}

const QuestionnaireChoice: React.FC<QuestionnaireChoiceProps> = ({ user }) => {
  // const questionnaires = [
  //   { id: 1, title: 'Semaglutide' },
  //   { id: 2, title: 'NAD Injection' },
  //   { id: 3, title: 'Metformin' },
  // ];
  const [questionnaires, setQuestionnaires] = useState<CheckQuestionnaire[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        setIsLoading(true);
        const data = await getQuestionnairesByUserId(user.id);
        if (data) setQuestionnaires(data);
      } catch (error) {
        console.error('Error fetching questionnaires:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionnaires();
  }, [user.id]);

  const handleQuestionnaireClick = (id: number) => {
    router.push(`/questionnaire/${id}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col">
      <Header user={user} />

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-8">
            Choose Your Questionnaire
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {questionnaires.map((q) => (
              <motion.div
                key={q.id}
                whileHover={!q.isCompleted ? { scale: 1.05 } : {}}
                whileTap={!q.isCompleted ? { scale: 0.95 } : {}}
              >
                <Card
                  className={`h-full transition-shadow duration-300 ${
                    q.isCompleted
                      ? 'bg-gray-200 cursor-default'
                      : 'hover:shadow-lg cursor-pointer'
                  }`}
                  onClick={() =>
                    !q.isCompleted && handleQuestionnaireClick(q.id)
                  }
                >
                  <CardContent className="relative flex items-center justify-center h-full p-6">
                    <h3 className="text-xl font-semibold text-center text-green-700">
                      {q.id}. {q.title}
                    </h3>
                    {q.isCompleted && (
                      <CheckCircle
                        className="absolute top-2 right-2 text-green-500"
                        size={24}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-4 text-center text-sm text-green-800">
        © 2023 Bioverse. All rights reserved.
      </footer>
    </div>
  );
};

export default QuestionnaireChoice;
