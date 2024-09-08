'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckQuestionnaire, User } from '@/types';
import { useRouter } from 'next/navigation';
import Header from './Header';
import { getQuestionnairesByUserId } from '@/lib/supabaseAdmin';
import { CheckCircle } from 'lucide-react';
import Footer from './Footer';
import ClipLoader from 'react-spinners/ClipLoader';

interface QuestionnaireChoiceProps {
  user: User;
}

const QuestionnaireChoice: React.FC<QuestionnaireChoiceProps> = ({ user }) => {
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

  // Check if all questionnaires are completed
  const allCompleted =
    questionnaires.length > 0 && questionnaires.every((q) => q.isCompleted);

  // Loading state with react-spinners
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col">
        <Header user={user} />
        <main className="flex-grow flex items-center justify-center p-4">
          <ClipLoader color="#4f46e5" size={50} /> {/* Loading spinner */}
        </main>
        <Footer />
      </div>
    );
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
          {/* Display message if all questionnaires are completed */}
          {allCompleted && (
            <div className="text-center text-green-800 font-semibold mt-4">
              All Questionnaires completed!
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuestionnaireChoice;
