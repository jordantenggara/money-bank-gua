import { z } from "zod";

const MAX_AMOUNT = 9_999_999_999.99;

function hasAtMostTwoDecimalPlaces(value: number) {
  const scaled = value * 100;
  return Math.abs(scaled - Math.round(scaled)) < 1e-7;
}

function isCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const transactionFields = {
  type: z.enum(["income", "expense"], {
    error: "Type must be income or expense.",
  }),
  amount: z
    .number({ error: "Amount must be a number." })
    .finite("Amount must be finite.")
    .positive("Amount must be greater than zero.")
    .max(MAX_AMOUNT, "Amount exceeds the supported limit.")
    .refine(hasAtMostTwoDecimalPlaces, {
      message: "Amount must have at most two decimal places.",
    }),
  description: z
    .string({ error: "Description is required." })
    .trim()
    .min(1, "Description is required.")
    .max(200, "Description must be 200 characters or fewer."),
  transactionDate: z
    .string({ error: "Transaction date is required." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Transaction date must use YYYY-MM-DD.")
    .refine(isCalendarDate, "Transaction date must be a valid date."),
};

export const createTransactionSchema = z.object(transactionFields).strict();

export const updateTransactionSchema = z
  .object(transactionFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one transaction field is required.",
  });

export const transactionIdSchema = z.uuid("Transaction ID must be a valid UUID.");
