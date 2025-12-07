"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallbackHref, label = "Back", className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={className}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
