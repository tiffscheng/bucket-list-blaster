
import DOMPurify from 'dompurify';

// Input length limits
export const INPUT_LIMITS = {
  TITLE: 500,
  DESCRIPTION: 2000,
  LABEL: 100,
  EMAIL: 254, // RFC 5321 standard
  PASSWORD: 128,
  SUBTASK_TITLE: 300,
} as const;

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
  });
};

// Validate and sanitize text input
export const sanitizeTextInput = (input: string, maxLength: number): string => {
  if (!input) return '';
  
  // Trim whitespace
  const trimmed = input.trim();
  
  // Check length limit
  if (trimmed.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  // Sanitize HTML
  return sanitizeHtml(trimmed);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= INPUT_LIMITS.EMAIL;
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: feedback.length === 0,
    score,
    feedback,
  };
};

// Get password strength label
export const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Fair';
    case 4:
      return 'Good';
    case 5:
      return 'Strong';
    default:
      return 'Very Weak';
  }
};

// Get password strength color
export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-600';
    case 2:
      return 'text-orange-600';
    case 3:
      return 'text-yellow-600';
    case 4:
      return 'text-blue-600';
    case 5:
      return 'text-green-600';
    default:
      return 'text-red-600';
  }
};

// Validate special characters (basic check)
export const containsOnlyAllowedChars = (input: string): boolean => {
  // Allow alphanumeric, spaces, and common punctuation
  const allowedCharsRegex = /^[a-zA-Z0-9\s\-_.,!?'"()\[\]{}:;@#$%&*+=<>\/\\|\n\r]*$/;
  return allowedCharsRegex.test(input);
};
