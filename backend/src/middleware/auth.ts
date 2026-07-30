import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';
  };
}

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("DECODED USER:", decoded);
    req.user = decoded; // VERY IMPORTANT

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userRole = String(req.user.role).trim().toUpperCase();

    console.log("USER ROLE:", userRole);
    console.log("ALLOWED ROLES:", allowedRoles);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
    }

    next();
  };
};