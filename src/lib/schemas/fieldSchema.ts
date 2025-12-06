import { z } from "zod";

export const fieldSchema = z.object({
  name: z.string().min(2, "Name is required"),
  abbreviatedName: z.string().optional(),
  nickName: z.string().optional(),
  schoolId: z.string().optional(),
  location: z.string().optional(),
  
  // Physical
  capacity: z.coerce.number().min(0).optional(),
  pitchCount: z.coerce.number().min(0).optional(),
  pitchType: z.enum([
    "Natural Turf", 
    "Artificial Astro-Turf", 
    "Hybrid", 
    "Matting", 
    "Concrete", 
    "Indoor"
  ]).optional(),
  
  // Surface
  surfaceConditionRating: z.coerce.number().min(1).max(5).optional(),
  surfaceDetails: z.record(z.string(), z.any()).optional(),
  
  // Dimensions
  boundaryMin: z.coerce.number().optional(),
  boundaryMax: z.coerce.number().optional(),
  pitchLength: z.coerce.number().optional(),
  pitchWidth: z.coerce.number().optional(),
  
  // Facilities
  floodlights: z.boolean().default(false),
  changingRoomsCount: z.coerce.number().optional(),
  practiceNetsCount: z.coerce.number().optional(),
  scoreboardType: z.enum([
    "Manual", 
    "Digital (Basic)", 
    "Electronic LED", 
    "Video Screen"
  ]).optional(),
  
  amenities: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type FieldFormValues = z.infer<typeof fieldSchema>;
