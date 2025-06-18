'use client';

import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LogoutButtonProps extends ButtonProps {
  // Extends all Button props
}

export function LogoutButton({ className, ...props }: LogoutButtonProps) {
  const { logout, loading } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`text-sm font-medium hover:bg-transparent hover:underline ${className || ''}`}
        onClick={() => setShowLogoutDialog(true)}
        disabled={isLoggingOut}
        {...props}
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </>
        )}
      </Button>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
