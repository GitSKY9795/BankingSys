import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().refine((value) => /^\S+@\S+\.\S+$/.test(value), { message: "Enter a valid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required").max(80, "Name is too long"),
    email: z.string().refine((value) => /^\S+@\S+\.\S+$/.test(value), { message: "Enter a valid email address" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const verifySchema = z.object({
  email: z.string().refine((value) => /^\S+@\S+\.\S+$/.test(value), { message: "Enter the same email used during registration" }),
  otp: z.string().regex(/^\d{4,8}$/, "Enter the verification code from your inbox"),
});

export const transferSchema = z.object({
  fromAccount: z.string().min(1, "Choose the source account"),
  toAccount: z.string().min(1, "Choose the destination account"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  idempotencyKey: z.string().min(8, "Unable to generate request key"),
});

export const resendSchema = z.object({
  email: z.string().refine((value) => /^\S+@\S+\.\S+$/.test(value), { message: "Enter a valid email address" }),
});

export const accountFilterSchema = z.object({
  accountId: z.string().optional(),
  type: z.enum(["all", "sent", "received"]).default("all"),
});
