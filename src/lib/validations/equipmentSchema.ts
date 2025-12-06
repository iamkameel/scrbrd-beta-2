import { z } from 'zod';

// Equipment validation schema
export const equipmentSchema = z.object({
  name: z.string()
    .min(1, 'Equipment name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  category: z.enum([
    'Bats',
    'Balls',
    'Protective Gear',
    'Stumps & Bails',
    'Training Equipment',
    'Groundskeeping',
    'Scoreboard',
    'Other'
  ], {
    message: 'Please select a valid category'
  }),
  
  quantity: z.string()
    .min(1, 'Quantity is required')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 10000;
    }, 'Quantity must be between 0 and 10,000'),
  
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'], {
    message: 'Please select a condition'
  }),
  
  location: z.string()
    .min(1, 'Location is required')
    .max(100, 'Location must be less than 100 characters'),
  
  purchaseDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const purchaseDate = new Date(date);
      const today = new Date();
      return purchaseDate <= today;
    }, 'Purchase date cannot be in the future'),
  
  purchasePrice: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 1000000;
    }, 'Price must be between 0 and 1,000,000'),
  
  supplier: z.string()
    .max(100, 'Supplier name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  serialNumber: z.string()
    .max(50, 'Serial number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export type EquipmentFormData = z.infer<typeof equipmentSchema>;
