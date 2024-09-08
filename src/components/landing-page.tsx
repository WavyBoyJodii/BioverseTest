'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZLoginSchema, loginSchema } from '@/types';
import { handleLogin } from '@/lib/handleLogin';
import { useRouter } from 'next/navigation';
import setUserId from '@/lib/setUserId';
import setAuth from '@/lib/setAuth';
import { toast } from 'sonner';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const loginCombinations = [
  { username: 'admin', password: 'admin1', admin: true },
  { username: 'user1', password: 'password1', admin: false },
  { username: 'user2', password: 'password2', admin: false },
  { username: 'user3', password: 'password3', admin: false },
  { username: 'user4', password: 'password4', admin: false },
];

export default function LandingPage() {
  const [isRevealed, setIsRevealed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ZLoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: ZLoginSchema) => {
    const response = await handleLogin(data.username, data.password);
    if (response.success) {
      await setUserId(response.user?.id);
      await setAuth();
      toast(`${data.username} has been logged in`);
      setTimeout(() => {
        if (response.user.is_admin) {
          router.push('/admin');
        } else {
          router.push('/choices');
        }
      }, 2000);
    } else {
      toast(`${response.reason}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Bioverse</h1>
          <p className="text-xl text-green-600 italic">
            Vibrant Living Backed by Science
          </p>
        </div>
        <div className="bg-white shadow-xl rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register('username')}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Log In
            </Button>
          </form>
        </div>
        <div className="mt-4 bg-gray-200 rounded-lg overflow-hidden">
          <Button
            onClick={() => setIsRevealed(!isRevealed)}
            className="w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold flex items-center justify-center"
          >
            {isRevealed ? (
              <>
                <EyeOffIcon className="w-5 h-5 mr-2" />
                Hide Logins
              </>
            ) : (
              <>
                <EyeIcon className="w-5 h-5 mr-2" />
                Reveal Logins
              </>
            )}
          </Button>
          {isRevealed ? (
            <div
              className={`p-4 space-y-2 max-h-96 transition-all duration-300 ease-in-out overflow-hidden`}
            >
              {loginCombinations.map((login, index) => (
                <p key={index} className="text-sm">
                  Username: {login.username}, Password: {login.password}{' '}
                  {login.admin ? '(Admin)' : ''}
                </p>
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="mt-8 text-sm text-green-800 text-center">
        © 2024 Bioverse. All rights reserved.
      </div>
    </div>
  );
}
