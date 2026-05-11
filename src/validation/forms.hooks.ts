import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  SendLoginOtpForm,
  LoginWithOtpForm,
  LoginWithPasswordForm,
  ResetPasswordForm,
  ChangePasswordForm,
  PinForm,
  VerifyPinForm,
} from './auth.schema';
import {
  sendLoginOtpSchema,
  loginWithOtpSchema,
  loginWithPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  pinSchema,
  verifyPinSchema,
} from './auth.schema';
import { makePaymentSchema } from './payment.schema';
import type { MakePaymentForm } from './payment.schema';

export const useSendLoginOtpForm = () => {
  return useForm<SendLoginOtpForm>({
    resolver: zodResolver(sendLoginOtpSchema),
    defaultValues: {
      mobileNo: '',
      email: '',
    },
  });
};

export const useLoginWithOtpForm = (mobileNo = '') => {
  return useForm<LoginWithOtpForm>({
    resolver: zodResolver(loginWithOtpSchema),
    defaultValues: {
      mobileNo,
      otp: '',
    },
  });
};

export const useLoginWithPasswordForm = () => {
  return useForm<LoginWithPasswordForm>({
    resolver: zodResolver(loginWithPasswordSchema),
    defaultValues: {
      mobileNo: '',
      email: '',
      password: '',
    },
  });
};

export const useResetPasswordForm = () => {
  return useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      userId: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
};

export const useChangePasswordForm = () => {
  return useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });
};

export const usePinForm = () => {
  return useForm<PinForm>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: '',
    },
  });
};

export const useVerifyPinForm = () => {
  return useForm<VerifyPinForm>({
    resolver: zodResolver(verifyPinSchema),
    defaultValues: {
      pin: '',
    },
  });
};

export const useMakePaymentForm = () => {
  return useForm<MakePaymentForm>({
    resolver: zodResolver(makePaymentSchema),
    defaultValues: {
      loanId: '',
      loanNo: '',
      amount: '',
    },
  });
};
