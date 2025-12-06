import { z } from 'zod';

export const EquipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  type: z.string().min(1, 'Type is required'),
  brand: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Available', 'In Use', 'Maintenance', 'Damaged']),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  assignedTo: z.string().nullable().optional(),
  cost: z.number().min(0).optional(),
});

export type EquipmentInput = z.infer<typeof EquipmentSchema>;
