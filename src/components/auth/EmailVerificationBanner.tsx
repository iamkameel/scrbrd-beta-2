"use client";

import { useState } from "react";
import { AlertCircle, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function EmailVerificationBanner() {
  const { user, sendVerificationEmail } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  // Don't show banner if user is not logged in, email is verified, or user dismissed it
  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Please verify your email address
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              We sent a verification link to <strong>{user.email}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={sending}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700"
          >
            <Mail className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Resend Email"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
