'use client';

import { Button } from '@/components/ui/button';
import clearAuthCookie from '@/lib/clearAuthAndUser';
import { User } from '@/types';
import { UserCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuthCookie();
    toast('Logging out User');
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="w-24"></div> {/* Spacer */}
        <h1 className="text-3xl font-bold text-green-800">Bioverse</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserCircle className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">{user.username}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
