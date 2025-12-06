import { z } from "zod";

export const leagueSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  provinceId: z.string().min(1, { message: "Province is required" }),
  type: z.enum(["League", "Series", "Cup", "Friendly"], {
    message: "Please select a valid league type"
  }),
  description: z.string().max(500, { message: "Description must be less than 500 characters" }).optional(),
});

export type LeagueInput = z.infer<typeof leagueSchema>;
