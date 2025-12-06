'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-2xl">Application Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            An error occurred while rendering this page. Please try again or return to the home page.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-slate-100 rounded-lg overflow-auto">
              <p className="font-mono text-sm text-destructive">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={reset}>Try Again</Button>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
