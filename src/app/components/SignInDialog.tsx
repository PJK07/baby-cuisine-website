import { useState } from "react";
import { AlertCircle, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface SignInDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SignInDialog({ isOpen, onOpenChange }: SignInDialogProps) {
  const {
    user,
    isConfigured,
    isLoading,
    signInWithGoogle,
    signOut,
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start sign in.");
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSubmitting(true);
      await signOut();
      toast.success("Signed out");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[1.75rem] border-brand-dark/10 bg-white p-0 shadow-2xl overflow-hidden">
        <div className="bg-brand-bg/70 px-6 py-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-brand-dark">
              {user ? "Your account" : "Sign in"}
            </DialogTitle>
            <DialogDescription className="text-brand-dark/70">
              {user
                ? "Manage the account connected to your Baby Cuisine orders."
                : "Continue with your Google account."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-5">
          {!isConfigured ? (
            <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold">Supabase needs setup</p>
                <p className="mt-1 text-sm">
                  Add your Supabase URL and anon key to .env, then restart the dev server.
                </p>
              </div>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-brand-dark/10 bg-brand-bg/30 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-primary shadow-sm">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-brand-dark">{user.email}</p>
                  <p className="text-sm text-brand-dark/60">Signed in</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-dark px-5 py-3 font-bold text-white transition-colors hover:bg-brand-dark/90"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-brand-dark/15 bg-white px-5 py-3 font-bold text-brand-dark shadow-sm transition-colors hover:bg-brand-bg/40"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4285F4] text-sm font-bold text-white">
                  G
                </span>
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
