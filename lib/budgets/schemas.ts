import { z } from "zod";

export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month format. Expected YYYY-MM.");

export const budgetAmountSchema = z.number().positive("Budget amount must be positive.").max(9999999999.99);

export const setBudgetSchema = z.object({
  month: monthSchema,
  amount: z.union([z.string(), z.number()]).transform((val) => Number(val)).pipe(budgetAmountSchema),
});
