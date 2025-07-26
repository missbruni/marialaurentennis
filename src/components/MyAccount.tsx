'use client';

import { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useRouter } from 'next/navigation';

type MyAccountProps = {
  onLoginClick: () => void;
};
const MyAccount: React.FC<MyAccountProps> = ({ onLoginClick }) => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const getInitials = (user: User) => {
    return user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase();
  };

  const viewBookings = () => {
    router.push('/bookings');
  };

  if (loading) return null;

  return user ? (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className="hover:ring-primary/50 relative h-10 w-10 cursor-pointer overflow-hidden rounded-full object-cover transition-all hover:ring-2">
          {user.photoURL ? (
            <AvatarImage
              data-testid="avatar-image"
              src={user.photoURL}
              alt={`${user.displayName || 'User'}'s profile`}
            />
          ) : (
            <AvatarFallback className="bg-tennis-green text-white dark:text-black">
              {getInitials(user)}
            </AvatarFallback>
          )}
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="flex flex-col gap-2">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start text-left"
            onClick={viewBookings}
          >
            View Bookings
          </Button>
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start text-left"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ) : (
    <Button
      size="lg"
      variant="ghost"
      className="text-foreground hidden h-9 cursor-pointer items-center justify-center rounded-md border-1 px-4 transition-colors duration-200 hover:bg-white/20 md:inline-flex"
      onClick={onLoginClick}
      aria-label="Login"
    >
      Login
    </Button>
  );
};

export default MyAccount;
