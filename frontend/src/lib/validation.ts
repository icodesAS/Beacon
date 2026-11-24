import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(50, "Full name must be at most 50 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .max(100, "Email must be at most 100 characters.")
      .email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Password must include at least one letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Contact name must be at least 2 characters.")
    .max(50, "Contact name must be at most 50 characters."),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Phone must be 10 digits starting with 6, 7, 8, or 9."),
  relation: z.enum(
    ["PARENT", "SIBLING", "FRIEND", "NEIGHBOR", "DOCTOR", "OTHER"],
    { message: "Please select a valid relation." }
  ),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const sosMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters.")
    .max(300, "Message must be at most 300 characters."),
  locationText: z
    .string()
    .trim()
    .max(100, "Location must be at most 100 characters.")
    .optional(),
});

export type SosMessageFormValues = z.infer<typeof sosMessageSchema>;
