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
import { getUsersWithResponses } from '@/lib/supabaseAdmin';
import Header from './Header';
import { User, UserWithCompletions } from '@/types';
import Footer from './Footer';
import ClipLoader from 'react-spinners/ClipLoader';

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
              {/* If users is null, display the loading spinner */}
              {!users ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    <ClipLoader color="#4f46e5" size={50} />
                  </TableCell>
                </TableRow>
              ) : (
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
