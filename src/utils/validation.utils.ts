export const isValidMobile = (mobile: string): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPin = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};

export const isValidOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const sanitizeInput = (input: string): string => {
  return input.trim();
};
