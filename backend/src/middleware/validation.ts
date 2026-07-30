import { Request, Response, NextFunction } from 'express';

// Standard email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password complexity: 8-16 chars, at least 1 uppercase, at least 1 special char
const validatePasswordStrength = (password: string): string | null => {
  if (!password || password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  // Check for at least one special character (any non-alphanumeric or standard symbols)
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, address } = req.body;
  const errors: Record<string, string> = {};

  // Name check
  if (!name || name.length < 20 || name.length > 60) {
    errors.name = 'Name must be between 20 and 60 characters long.';
  }

  // Email check
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Address check
  if (!address || address.length > 400) {
    errors.address = 'Address cannot exceed 400 characters.';
  }

  // Password check
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateAdminUserCreate = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, address, role } = req.body;
  const errors: Record<string, string> = {};

  // Name check
  if (!name || name.length < 20 || name.length > 60) {
    errors.name = 'Name must be between 20 and 60 characters long.';
  }

  // Email check
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Address check
  if (!address || address.length > 400) {
    errors.address = 'Address cannot exceed 400 characters.';
  }

  // Password check
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  // Role check
  if (!role || !['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
    errors.role = 'Role must be one of ADMIN, NORMAL_USER, or STORE_OWNER.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validatePasswordUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  const errors: Record<string, string> = {};

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
