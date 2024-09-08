'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import Header from './Header';

interface QuestionnaireChoiceProps {
  user: User;
}

const QuestionnaireChoice: React.FC<QuestionnaireChoiceProps> = ({ user }) => {
  const questionnaires = [
    { id: 1, title: 'Semaglutide' },
    { id: 2, title: 'NAD Injection' },
    { id: 3, title: 'Metformin' },
  ];
  const router = useRouter();

  const handleQuestionnaireClick = (id: number) => {
    router.push(`/questionnaire/${id}`);
  };

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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuestionnaireClick(q.id)}
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="flex items-center justify-center h-full p-6">
                    <h3 className="text-xl font-semibold text-center text-green-700">
                      {q.id}. {q.title}
                    </h3>
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
