// Routing hints never grant permission. The server checks every protected action.
export const passwordHint = 'Use 8–128 characters. Your password manager can create and save a strong password.';
export function passwordError(value, confirmation) {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) return 'Choose a password with 8–128 characters.';
  if (confirmation !== undefined && value !== confirmation) return 'The passwords do not match.';
  return '';
}
export function goldenAccountCallback(recovery = false) {
  const url = new URL('/account.html', 'https://goldenrama440.com');
  url.search = new URLSearchParams({site:'goldenrama440', role:'customer', [recovery ? 'recovery' : 'verified']:'1'}).toString();
  return url.href;
}
export function validEmail(value) {
  return typeof value === 'string' && value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
export function accountError(error) {
  const raw = String(error?.message || '');
  if (/rate.limit|too many|wait.*seconds/i.test(raw)) return 'Please wait before requesting another email. You can still sign in with your existing password or Google on the website.';
  if (/invalid.*credentials|invalid.*login/i.test(raw)) return 'That email or password does not match. Try again or choose Forgot password.';
  if (/email.*not.*confirm|confirm.*email|verify.*email/i.test(raw)) return 'Verify your email first, then sign in. You can request another verification email below.';
  if (/already.*register|already.*exist|user.*exist/i.test(raw)) return 'An account already uses this email. Choose Sign in or Forgot password.';
  if (/password/i.test(raw) && /short|least|length|weak|characters|match/i.test(raw)) return raw;
  if (/abort|timeout|network|fetch/i.test(raw)) return 'The connection was interrupted. Please try again.';
  return 'We could not complete that account action. Please try again shortly.';
}
