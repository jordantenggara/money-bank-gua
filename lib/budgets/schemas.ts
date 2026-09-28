import { z } from "zod";

const MAX_BUDGET_AMOUNT = 9_999_999_999.99;

export const budgetMonthSchema = z
  .string({ message: "Month is required." })
  .regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, "Month must use YYYY-MM.")
  .refine((value) => Number(value.slice(0, 4)) > 0, {
    message: "Month must use a valid calendar year.",
  });

export const budgetAmountSchema = z
  .string({ message: "Amount is required." })
  .trim()
  .regex(/^\d+(?:\.\d{1,2})?$/, {
    message: "Amount must be a positive decimal with at most two decimal places.",
  })
  .transform(Number)
  .pipe(
    z
      .number()
      .finite("Amount must be finite.")
      .positive("Amount must be greater than zero.")
      .max(MAX_BUDGET_AMOUNT, "Amount exceeds the supported limit."),
  );

export const monthlyBudgetFormSchema = z
  .object({
    month: budgetMonthSchema,
    amount: budgetAmountSchema,
  })
  .strict();
