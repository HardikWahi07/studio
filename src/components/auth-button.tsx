'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { handleSignOut } from '@/firebase/auth/google';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthDialog } from './auth-dialog';
import { useTheme } from 'next-themes';

interface AuthButtonProps {
  isHomePage: boolean;
  isScrolled: boolean;
}

export function AuthButton({ isHomePage, isScrolled }: AuthButtonProps) {
  const { user, isUserLoading } = useUser();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { theme } = useTheme();

  const buttonColorClass = isHomePage && !isScrolled && theme === 'dark'
    ? 'text-white hover:text-white'
    : 'text-foreground hover:text-primary';


  if (isUserLoading) {
    return <Skeleton className="h-10 w-24" />;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || "Welcome"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsAuthDialogOpen(true)}
        variant="ghost"
        className={cn("hidden sm:inline-flex items-center gap-2 hover:bg-black/5", buttonColorClass)}
      >
        <LogIn className="w-4 h-4" /> Login
      </Button>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}
