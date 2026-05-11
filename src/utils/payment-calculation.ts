import type { Loan } from '@/types';

export interface PaymentCalculationInput {
  loan: Loan;
  paymentAmount: number;
}

export interface PaymentCalculationResult {
  canPay: boolean;
  error?: string;
  instruction?: string;
  payingIntDays: number;
  interestPerDay: number;
  totalCharges: number;
  netAmount: number;
  payinterest1: number;
  payinterest2: number;
  principalAdjustment: number;
  roundedTotal: number;
}

const ROUND_TO = 10;
const MIN_TRANSACTION = 100;

function ceilToNearest(value: number, multiple: number): number {
  return Math.ceil(value / multiple) * multiple;
}

function fail(
  error: string,
  extras: Partial<PaymentCalculationResult> = {},
): PaymentCalculationResult {
  return {
    canPay: false,
    error,
    instruction: error,
    payingIntDays: 0,
    interestPerDay: 0,
    totalCharges: 0,
    netAmount: 0,
    payinterest1: 0,
    payinterest2: 0,
    principalAdjustment: 0,
    roundedTotal: 0,
    ...extras,
  };
}

export class PaymentCalculator {
  /**
   * Live instruction shown as user types — mirrors old app's useEffect.
   * Permissive: does not do band validation, just describes what is being paid.
   * Returns { instruction, isPayable, minIntdaysWarning? }
   */
  static getInstruction(input: PaymentCalculationInput): {
    instruction: string;
    isPayable: boolean;
    minIntdaysWarning?: string;
  } {
    const { loan, paymentAmount } = input;

    const noticeAmount   = parseFloat(loan.NoticeAmount   || '0') || 0;
    const otherCharges   = parseFloat(loan.OtherCharges   || '0') || 0;
    const intAmount      = parseFloat(loan.IntAmount      || '0') || 0;
    const intDueDays     = parseFloat(loan.IntDuedays     || '0') || 0;
    const totalDueAmount = parseFloat(loan.TotalDueAmount || '0') || 0;
    const minIntdays     = parseInt(loan.MinIntdays       || '0') || 0;
    const pendingLoanAmt = parseFloat(loan.PendingLoanAmount || '0') || 0;
    const totalCharges   = noticeAmount + otherCharges;

    let payingAmountFloat = paymentAmount - totalCharges;

    // Non-blocking MinIntdays warning (old app shows message but doesn't block)
    let minIntdaysWarning: string | undefined;
    if (minIntdays < 15 && intAmount !== 0 && paymentAmount < intAmount) {
      minIntdaysWarning = `You must pay at least ${minIntdays} days interest (₹${intAmount.toLocaleString('en-IN')})`;
    }

    if (payingAmountFloat < 0) {
      return {
        instruction: `Please enter a valid amount. Minimum: ₹${totalCharges.toLocaleString('en-IN')}`,
        isPayable: false,
      };
    }

    if (intDueDays > 0) {
      const interestPerDay = Math.round((intAmount / intDueDays) * 100) / 100;

      if (payingAmountFloat <= intAmount) {
        const payingIntDays = Math.floor(payingAmountFloat / interestPerDay);
        const instruction = totalCharges > 0
          ? `You are paying ${payingIntDays} days interest + ₹${totalCharges.toLocaleString('en-IN')} charges`
          : `You are paying ${payingIntDays} days interest on this loan`;
        return { instruction, isPayable: true, minIntdaysWarning };
      } else {
        // Paying more than full interest
        const effectiveCeiling = totalDueAmount > 0 ? totalDueAmount : pendingLoanAmt;
        if (payingAmountFloat > effectiveCeiling) {
          return { instruction: 'You cannot pay more than the total due amount.', isPayable: false };
        }
        const principalAdjustment = payingAmountFloat - intAmount;
        const instruction = totalCharges > 0
          ? `You are paying ${intDueDays} days interest + ₹${principalAdjustment.toLocaleString('en-IN')} adjusted to principal + ₹${totalCharges.toLocaleString('en-IN')} charges`
          : `You are paying ${intDueDays} days interest + ₹${principalAdjustment.toLocaleString('en-IN')} will be adjusted into principal`;
        return { instruction, isPayable: true, minIntdaysWarning };
      }
    } else {
      // No interest due — pure principal
      const instruction = totalCharges > 0
        ? `₹${payingAmountFloat.toLocaleString('en-IN')} will be adjusted into principal + ₹${totalCharges.toLocaleString('en-IN')} charges`
        : `₹${payingAmountFloat.toLocaleString('en-IN')} will be adjusted into principal`;
      return { instruction, isPayable: true, minIntdaysWarning };
    }
  }

  /**
   * Strict gate matching old app's SendToPG — called only when user presses Pay.
   * Returns canPay=true only when amount is on a valid band and all rules pass.
   */
  static calculate(input: PaymentCalculationInput): PaymentCalculationResult {
    const { loan, paymentAmount } = input;

    const noticeAmount   = parseFloat(loan.NoticeAmount   || '0') || 0;
    const otherCharges   = parseFloat(loan.OtherCharges   || '0') || 0;
    const intAmount      = parseFloat(loan.IntAmount      || '0') || 0;
    const intDueDays     = parseFloat(loan.IntDuedays     || '0') || 0;
    const payFrequency   = parseFloat(loan.PayFrequency   || '0') || 0;
    const totalDueAmount = parseFloat(loan.TotalDueAmount || '0') || 0;
    const minIntdays     = parseInt(loan.MinIntdays       || '0') || 0;

    const totalCharges = noticeAmount + otherCharges;
    const netAmount = paymentAmount - totalCharges;

    // MinIntdays < 15 warning — old app shows message but does NOT block (falls through)
    // We surface this as a warning on the result, not a failure
    const minIntdaysWarning = (minIntdays < 15 && intAmount !== 0 && paymentAmount < intAmount)
      ? `You must pay at least ${minIntdays} days interest (₹${intAmount.toLocaleString('en-IN')})`
      : undefined;

    // Minimum transaction amount
    if (paymentAmount < MIN_TRANSACTION) {
      return fail(`Minimum transaction amount is ₹${MIN_TRANSACTION}`, { totalCharges, netAmount, roundedTotal: paymentAmount });
    }

    // Net must be multiple of 10
    if (netAmount % ROUND_TO !== 0) {
      return fail('Amount should be in multiples of 10', { totalCharges, netAmount, roundedTotal: paymentAmount });
    }

    // Auction check: PayFrequency < IntDueDays
    if (payFrequency > 0 && intDueDays > 0 && payFrequency < intDueDays) {
      return fail('This loan is under auction. Please contact branch.', { totalCharges, netAmount, roundedTotal: paymentAmount });
    }

    // Max payable: TotalDue - 90 (or PendingLoan - 90 when TotalDue = 0)
    const pendingLoanAmount = parseFloat(loan.PendingLoanAmount || '0') || 0;
    const effectiveCeiling = totalDueAmount > 0 ? totalDueAmount : pendingLoanAmount;
    const maxPayable = effectiveCeiling - 90;
    const blockExactTotal = totalDueAmount > 0 && paymentAmount === totalDueAmount;
    if (maxPayable > 0 && (netAmount > maxPayable || blockExactTotal)) {
      return fail(
        `You can pay ₹${maxPayable.toLocaleString('en-IN')} maximum`,
        { totalCharges, netAmount, roundedTotal: paymentAmount },
      );
    }

    // No interest days — pure principal, allow if above checks pass
    if (intDueDays <= 0) {
      const instruction = totalCharges > 0
        ? `₹${netAmount.toLocaleString('en-IN')} will be adjusted into principal + ₹${totalCharges.toLocaleString('en-IN')} charges`
        : `₹${netAmount.toLocaleString('en-IN')} will be adjusted into principal`;
      return {
        canPay: true,
        instruction,
        payingIntDays: 0,
        interestPerDay: 0,
        totalCharges,
        netAmount,
        payinterest1: paymentAmount,
        payinterest2: paymentAmount,
        principalAdjustment: netAmount,
        roundedTotal: paymentAmount,
      };
    }

    // Per-day interest
    const interestPerDay = Math.round((intAmount / intDueDays) * 100) / 100;
    const payingIntDays = Math.floor(netAmount / interestPerDay);

    // Two valid bands (ceiling to nearest 10)
    const pi1 = ceilToNearest(Math.round(payingIntDays       * interestPerDay), ROUND_TO);
    const pi2 = ceilToNearest(Math.round((payingIntDays + 1) * interestPerDay), ROUND_TO);
    const valid1 = pi1 + totalCharges;
    const valid2 = pi2 + totalCharges;

    // Paying beyond full interest → principal adjustment (old app allows this)
    if (netAmount > intAmount) {
      const principalAdjustment = netAmount - intAmount;
      const instruction = totalCharges > 0
        ? `Paying ${intDueDays} days interest + ₹${principalAdjustment.toLocaleString('en-IN')} principal + ₹${totalCharges.toLocaleString('en-IN')} charges`
        : `Paying ${intDueDays} days interest + ₹${principalAdjustment.toLocaleString('en-IN')} will be adjusted into principal`;
      return {
        canPay: true,
        instruction,
        payingIntDays: intDueDays,
        interestPerDay,
        totalCharges,
        netAmount,
        payinterest1: valid1,
        payinterest2: valid2,
        principalAdjustment,
        roundedTotal: paymentAmount,
      };
    }

    // Must land on a valid band
    if (netAmount !== pi1 && netAmount !== pi2) {
      if (valid1 < MIN_TRANSACTION) {
        return fail(
          `Please pay ₹${valid2.toLocaleString('en-IN')} or more`,
          { payingIntDays, interestPerDay, totalCharges, netAmount, payinterest1: valid1, payinterest2: valid2, roundedTotal: paymentAmount },
        );
      }
      return fail(
        `Please pay either ₹${valid1.toLocaleString('en-IN')} or ₹${valid2.toLocaleString('en-IN')}`,
        { payingIntDays, interestPerDay, totalCharges, netAmount, payinterest1: valid1, payinterest2: valid2, roundedTotal: paymentAmount },
      );
    }

    const instruction = minIntdaysWarning
      ?? (totalCharges > 0
        ? `Paying ${payingIntDays} days interest + ₹${totalCharges.toLocaleString('en-IN')} charges`
        : `Paying ${payingIntDays} days interest on this loan`);

    return {
      canPay: true,
      instruction,
      payingIntDays,
      interestPerDay,
      totalCharges,
      netAmount,
      payinterest1: valid1,
      payinterest2: valid2,
      principalAdjustment: 0,
      roundedTotal: paymentAmount,
    };
  }

  /**
   * Suggest the two nearest valid bands for quick-pay buttons.
   */
  static suggestAmounts(loan: Loan): { lower: number; upper: number; totalDue: number } {
    const intAmount      = parseFloat(loan.IntAmount      || '0') || 0;
    const intDueDays     = parseFloat(loan.IntDuedays     || '0') || 0;
    const noticeAmount   = parseFloat(loan.NoticeAmount   || '0') || 0;
    const otherCharges   = parseFloat(loan.OtherCharges   || '0') || 0;
    const totalDueAmount = parseFloat(loan.TotalDueAmount || '0') || 0;
    const totalCharges   = noticeAmount + otherCharges;

    if (intDueDays <= 0) {
      const pendingAmt = parseFloat(loan.PendingLoanAmount || '0') || 0;
      const effectiveCeil = totalDueAmount > 0 ? totalDueAmount : pendingAmt;
      const half = ceilToNearest(Math.floor((effectiveCeil - 90) / 2), ROUND_TO);
      return {
        lower: Math.max(totalCharges + MIN_TRANSACTION, MIN_TRANSACTION),
        upper: Math.max(half, MIN_TRANSACTION),
        totalDue: totalDueAmount,
      };
    }

    const interestPerDay = Math.round((intAmount / intDueDays) * 100) / 100;
    const halfDays = Math.floor(intDueDays / 2);

    const lower = ceilToNearest(Math.round(halfDays   * interestPerDay), ROUND_TO) + totalCharges;
    const upper = ceilToNearest(Math.round(intDueDays * interestPerDay), ROUND_TO) + totalCharges;

    const pendingLoanAmt = parseFloat(loan.PendingLoanAmount || '0') || 0;
    const effectiveCeiling = totalDueAmount > 0 ? totalDueAmount : pendingLoanAmt;

    return {
      lower: Math.max(lower, MIN_TRANSACTION),
      upper: Math.min(upper, effectiveCeiling - 90),
      totalDue: totalDueAmount,
    };
  }
}

export const paymentCalculator = PaymentCalculator;
