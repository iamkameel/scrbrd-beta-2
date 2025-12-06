import { z } from "zod";

export const SeasonSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  active: z.boolean().default(false),
});

export type SeasonFormData = z.infer<typeof SeasonSchema>;
