import { z } from 'zod';

export const makePaymentSchema = z.object({
  loanId: z.string().min(1, 'Loan is required'),
  loanNo: z.string().min(1, 'Loan number is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
});

export type MakePaymentForm = z.infer<typeof makePaymentSchema>;
