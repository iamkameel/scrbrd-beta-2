import { z } from 'zod';

// Field validation schema
export const fieldSchema = z.object({
  name: z.string()
    .min(1, 'Field name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  abbreviatedName: z.string()
    .max(10, 'Abbreviation must be 10 characters or less')
    .optional()
    .or(z.literal('')),
  
  nickName: z.string()
    .max(50, 'Nickname must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  location: z.string()
    .max(100, 'Location description must be less than 100 characters')
    .optional()
    .or(z.literal('')),
    
  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  status: z.enum(['Available', 'Maintenance', 'Booked', 'Closed'])
    .optional()
    .default('Available'),

  fieldSize: z.enum(['Full Size', 'Youth', 'Training Area'])
    .optional()
    .default('Full Size'),
    
  // Coordinates validation
  latitude: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    }, 'Latitude must be between -90 and 90'),
    
  longitude: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    }, 'Longitude must be between -180 and 180'),

  schoolId: z.string()
    .optional()
    .or(z.literal('')),
  
  capacity: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 200000;
    }, 'Capacity must be between 0 and 200,000'),
  
  pitchCount: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 50;
    }, 'Pitch count must be between 1 and 50'),
    
  boundaryMin: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 30 && num <= 100;
    }, 'Min boundary must be between 30m and 100m'),
    
  boundaryMax: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 40 && num <= 120;
    }, 'Max boundary must be between 40m and 120m'),

  // Surface Details
  surfaceConditionRating: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 5;
    }, 'Rating must be between 1 and 5'),

  grassCover: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, 'Grass cover must be between 0 and 100%'),

  moistureLevel: z.string().optional(),
  firmness: z.string().optional(),

  // Staffing
  contactPerson: z.string().max(100).optional().or(z.literal('')),
  contactPhone: z.string().max(50).optional().or(z.literal('')),
  groundsKeeperIds: z.array(z.string()).optional(),

  pitchType: z.enum([
    'Natural Turf', 
    'Drop-in Turf',
    'Artificial Astro-Turf', 
    'Matting Wicket',
    'Concrete Base',
    'Indoor Synthetic',
    'Hybrid Reinforced',
    'Drop-in Artificial',
    'Other'
  ], {
    message: 'Please select a pitch type'
  }).optional(),
  
  scoreboardType: z.enum([
    'Manual', 
    'Digital (Basic)', 
    'Electronic LED', 
    'Video Screen',
    'None'
  ], {
    message: 'Please select a scoreboard type'
  }).optional(),
  
  facilities: z.array(z.string()).optional(),
});

export type FieldFormData = z.infer<typeof fieldSchema>;
