// Email validation regex (RFC 5322 compliant)
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validatePassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

export interface PasswordStrength {
  score: number;
  label: 'Too Short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { score: 0, label: 'Too Short', color: '#9ca3af' };
  }

  let score = 0;

  // Length bonuses
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  const levels: Array<{ label: PasswordStrength['label']; color: string }> = [
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f97316' },
    { label: 'Good', color: '#eab308' },
    { label: 'Strong', color: '#22c55e' },
  ];

  const index = Math.min(score - 1, levels.length - 1);
  return {
    score,
    label: levels[index]?.label || 'Weak',
    color: levels[index]?.color || '#ef4444',
  };
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeInput(input: string): string {
  return input.trim();
}
