import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


// ── Global Express augmentation (must live in a compiled module) ──
declare global {
  namespace Express {
    interface Request {
      user?: string;
      userRole?: string;
    }
  }
}


const JWT_SECRET = process.env.JWT_SECRET as string;

interface AccessTokenPayload {
  id: string;
  role: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.usATK;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;

    req.user = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again.",
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
      return;
    }

    next();
  };
};