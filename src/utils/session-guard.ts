/**
 * Module-level flag tracking whether the current session has passed the
 * PIN/biometric gate. Resets on logout (clearAuth) so the next app open
 * always re-gates correctly.
 *
 * Using a plain object reference (not React state) so it is readable
 * synchronously from both AppGate and verify-pin without prop drilling.
 */
const _state = { verified: false };

export const sessionGuard = {
  markVerified: () => { _state.verified = true; },
  markUnverified: () => { _state.verified = false; },
  isVerified: () => _state.verified,
};
