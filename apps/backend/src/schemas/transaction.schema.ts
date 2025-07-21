import { z } from 'zod';

export const createTransactionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  priceGBP: z
    .number()
    .positive('Price must be a positive number')
    .finite('Price must be a valid number')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
});

export const approveTransactionSchema = z.object({
  id: z
    .string()
    .uuid('Invalid transaction ID format'),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
export type ApproveTransactionDto = z.infer<typeof approveTransactionSchema>;