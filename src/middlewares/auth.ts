import {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";
import { User } from "../models/UserModel";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.usATK;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      id: string;
      role: string;
    };

    const user = await User.findById(
      decoded.id
    ).select("_id role isActive");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account not found.",
      });

      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "This account has been deactivated.",
      });

      return;
    }

    req.user = {
      id: user.id.toString(),
      role: user.role,
    };

    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Your session has expired.",
        code: "ACCESS_TOKEN_EXPIRED",
      });

      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

export default authMiddleware;