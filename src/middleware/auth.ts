import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/queries.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  userRole?: string;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Synchronize to PostgreSQL users table
    if (decodedToken.uid && decodedToken.email) {
      try {
        const dbUser = await getOrCreateUser(
          decodedToken.uid,
          decodedToken.email,
          decodedToken.name,
          decodedToken.phone_number
        );
        req.dbUser = dbUser;
        req.userRole = dbUser?.role || 'customer';
      } catch (err) {
        console.warn('Postgres user sync warning:', err);
        req.userRole = decodedToken.email === 'tejsinghsaud70@gmail.com' ? 'admin' : 'customer';
      }
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // First ensure authenticated
  await requireAuth(req, res, () => {
    const email = req.user?.email;
    const isOwner = email === 'tejsinghsaud70@gmail.com';
    const isAdminRole = req.userRole === 'admin' || isOwner;

    if (!isAdminRole) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  });
};
