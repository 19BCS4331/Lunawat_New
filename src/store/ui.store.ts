import { create } from 'zustand';
import type { PaymentState } from '@/types';

interface UIStore extends PaymentState {
  setPaymentProcessing: (isProcessing: boolean) => void;
  setCurrentTransaction: (transactionId: string | null) => void;
  setPendingPayment: (payment: { loanId: string; amount: string; timestamp: number } | null) => void;
  clearPaymentState: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isProcessing: false,
  currentTransaction: null,
  pendingPayment: null,
  setPaymentProcessing: (isProcessing) => set({ isProcessing }),
  setCurrentTransaction: (transactionId) => set({ currentTransaction: transactionId }),
  setPendingPayment: (payment) => set({ pendingPayment: payment }),
  clearPaymentState: () =>
    set({
      isProcessing: false,
      currentTransaction: null,
      pendingPayment: null,
    }),
}));
