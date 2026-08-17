import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";

const authAdmin = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const token = req.cookies.AdATK;

    if (!token) {
      res.status(200).json({
        success: false,
        message: "Admin not authenticated",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      res.status(200).json({
        success: false,
        message: "Access denied",
      });
      return;
    }
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authAdmin;