import { z } from "zod";

export const LeagueSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  provinceId: z.string().min(1, "Province is required"),
  type: z.enum(["League", "Series", "Cup", "Friendly"], {
    message: "Please select a valid league type"
  }),
  description: z.string().optional(),
});

export type LeagueFormData = z.infer<typeof LeagueSchema>;
