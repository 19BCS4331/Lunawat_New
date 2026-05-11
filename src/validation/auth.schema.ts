import { z } from 'zod';

export const sendLoginOtpSchema = z.object({
  mobileNo: z.string().optional(),
  email: z.string().optional(),
});

export const loginWithOtpSchema = z.object({
  mobileNo: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^[0-9]+$/, 'Mobile number must contain only digits'),
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only digits'),
});

export const loginWithPasswordSchema = z.object({
  mobileNo: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.mobileNo || data.email, {
  message: 'Please enter a mobile number or email',
  path: ['mobileNo'],
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const pinSchema = z.object({
  pin: z
    .string()
    .min(4, 'PIN must be 4 digits')
    .max(4, 'PIN must be 4 digits')
    .regex(/^[0-9]+$/, 'PIN must contain only digits'),
});

export const verifyPinSchema = z.object({
  pin: z
    .string()
    .min(4, 'PIN must be 4 digits')
    .max(4, 'PIN must be 4 digits')
    .regex(/^[0-9]+$/, 'PIN must contain only digits'),
});

export type SendLoginOtpForm = z.infer<typeof sendLoginOtpSchema>;
export type LoginWithOtpForm = z.infer<typeof loginWithOtpSchema>;
export type LoginWithPasswordForm = z.infer<typeof loginWithPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type PinForm = z.infer<typeof pinSchema>;
export type VerifyPinForm = z.infer<typeof verifyPinSchema>;
