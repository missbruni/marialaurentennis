import { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type LoginIndicatorProps = {
  onLoginClick: () => void;
};
const LoginIndicator: React.FC<LoginIndicatorProps> = ({ onLoginClick }) => {
  const { user, logout, loading } = useAuth();

  const getInitials = (user: User) => {
    return user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase();
  };

  if (loading) return null;

  return user ? (
    <Popover>
      <PopoverTrigger asChild>
        <Avatar className="object-cover relative w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
          {user.photoURL ? (
            <AvatarImage
              data-testid="avatar-image"
              src={user.photoURL}
              alt={`${user.displayName || 'User'}'s profile`}
            />
          ) : (
            <AvatarFallback>{getInitials(user)}</AvatarFallback>
          )}
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="flex flex-col gap-2">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-left" onClick={logout}>
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ) : (
    <Button
      size="lg"
      variant="ghost"
      className="border-1 cursor-pointer duration-200 hidden md:inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/20 text-foreground h-9 px-4"
      onClick={onLoginClick}
      aria-label="Login"
    >
      Login
    </Button>
  );
};

export default LoginIndicator;
