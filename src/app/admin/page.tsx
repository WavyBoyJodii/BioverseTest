'use client';

import { Button } from '@/components/ui/button';
import clearAuthCookie from '@/lib/clearAuthAndUser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

export default function Admin() {
  const router = useRouter();
  const handleLogout = async () => {
    await clearAuthCookie();
    toast('Logging out User');
    setTimeout(() => {
      router.refresh();
    }, 2000);
  };
  return (
    <div>
      <p>No admin page yet</p>
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
  );
}
