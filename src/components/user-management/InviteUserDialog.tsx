"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { ROLE_GROUPS } from "@/lib/roles";
import { UserService } from "@/lib/userService";

const InvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  message: z.string().optional(),
});

type InvitationInput = z.infer<typeof InvitationSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({ open, onOpenChange }: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvitationInput>({
    resolver: zodResolver(InvitationSchema),
    defaultValues: {
      email: "",
      role: "Player",
      firstName: "",
      lastName: "",
      message: "",
    },
  });

  const onSubmit = async (data: InvitationInput) => {
    setIsSubmitting(true);
    
    try {
      await UserService.inviteUser(data.email, data.role);
      toast.success(`Invitation sent to ${data.email}!`);
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to invite user:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite New User
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to join the platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...form.register("firstName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...form.register("lastName")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) => form.setValue("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <textarea
              id="message"
              {...form.register("message")}
              placeholder="Add a personal message to the invitation..."
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
