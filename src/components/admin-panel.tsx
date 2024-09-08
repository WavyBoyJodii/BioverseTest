'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserCircle, LogOut } from 'lucide-react';
import { getUsersWithResponses } from '@/lib/supabaseAdmin';
import Header from './Header';
import { User, UserWithCompletions } from '@/types';

// interface UserWithCompletions {
//   id: number;
//   username: string;
//   completedQuestionnaires: number;
// }

// interface QuestionnaireResponse {
//   questionnaireName: string;
//   questions: { question: string; answer: string }[];
// }

// interface UserResponses {
//   username: string;
//   responses: QuestionnaireResponse[];
// }

// // Mock data for users
// const users: UserWithCompletions[] = [
//   { id: 1, username: 'user1', completedQuestionnaires: 2 },
//   { id: 2, username: 'user2', completedQuestionnaires: 1 },
//   { id: 3, username: 'user3', completedQuestionnaires: 3 },
// ];

// // Mock data for user responses
// const userResponses: { [key: number]: UserResponses } = {
//   1: {
//     username: 'user1',
//     responses: [
//       {
//         questionnaireName: 'Semaglutide',
//         questions: [
//           { question: 'Have you used Semaglutide before?', answer: 'No' },
//           { question: 'What is your current weight?', answer: '70 kg' },
//         ],
//       },
//       {
//         questionnaireName: 'Metformin',
//         questions: [
//           { question: 'Are you diabetic?', answer: 'No' },
//           { question: 'Do you have any kidney issues?', answer: 'No' },
//         ],
//       },
//     ],
//   },
//   2: {
//     username: 'user2',
//     responses: [
//       {
//         questionnaireName: 'NAD Injection',
//         questions: [
//           { question: 'Have you had NAD injections before?', answer: 'Yes' },
//           {
//             question: 'Did you experience any side effects?',
//             answer: 'Mild headache',
//           },
//         ],
//       },
//     ],
//   },
//   3: {
//     username: 'user3',
//     responses: [
//       {
//         questionnaireName: 'Semaglutide',
//         questions: [
//           { question: 'Have you used Semaglutide before?', answer: 'Yes' },
//           { question: 'What is your current weight?', answer: '85 kg' },
//         ],
//       },
//       {
//         questionnaireName: 'NAD Injection',
//         questions: [
//           { question: 'Have you had NAD injections before?', answer: 'No' },
//           { question: 'Do you have any allergies?', answer: 'None' },
//         ],
//       },
//       {
//         questionnaireName: 'Metformin',
//         questions: [
//           { question: 'Are you diabetic?', answer: 'Yes' },
//           { question: 'Do you have any kidney issues?', answer: 'No' },
//         ],
//       },
//     ],
//   },
// };

interface AdminPanelProps {
  user: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [users, setUsers] = useState<UserWithCompletions[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithCompletions | null>(
    null
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const usersWithResponses = await getUsersWithResponses();
      setUsers(usersWithResponses);
    };
    fetchUsers();
  }, []);

  const handleUserClick = (index: number) => {
    if (users) {
      setSelectedUser(users[index]);
    } else throw Error('no users');
  };

  const formatAnswer = (answer: string[]) => {
    return answer.join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col">
      <Header user={user} />

      <main className="flex-grow flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">
            User Questionnaire Responses
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Completed Questionnaires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users &&
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.completedQuestionnaires}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => handleUserClick(index)}
                          >
                            View Responses
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              {selectedUser?.username}&apos;s Responses
                            </DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh] mt-4">
                            {selectedUser?.responses.map((response, index) => (
                              <div key={index} className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                  {response.questionnaireName}
                                </h3>
                                {response.questions.map((qa, qaIndex) => (
                                  <div key={qaIndex} className="mb-2">
                                    <p className="font-medium">
                                      Q: {qa.question}
                                    </p>
                                    <p className="pl-4">
                                      A: {formatAnswer(qa.answer)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <footer className="mt-auto py-4 text-center text-sm text-green-800">
        © 2023 Bioverse. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminPanel;
