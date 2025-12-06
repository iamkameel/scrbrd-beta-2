import { z } from 'zod';

export const TransactionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['Income', 'Expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['Completed', 'Pending', 'Cancelled']),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
