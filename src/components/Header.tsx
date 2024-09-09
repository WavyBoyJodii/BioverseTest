import React from 'react';
import { Button } from '@/components/ui/button';
import clearAuthCookie from '@/lib/clearAuthAndUser';
import { User } from '@/types';
import { UserCircle, LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await clearAuthCookie();
    toast(`${user.username} has been logged out`);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800">
          Bioverse
        </h1>

        {/* Desktop view */}
        <div className="hidden md:flex items-center space-x-4">
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

        {/* Mobile view - Menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-col items-center space-y-4">
            <span className="text-lg font-medium">{user.username}</span>
            <Button
              variant="outline"
              size="sm"
              className="w-full max-w-xs flex items-center justify-center space-x-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
