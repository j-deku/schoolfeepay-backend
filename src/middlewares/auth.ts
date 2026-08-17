import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";

const authMiddleware = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const token = req.cookies.usATK;

    if (!token) {
      res.status(200).json({ success: false, message: "Unauthorized Access" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string, role: string};

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(200).json({
          success:false
      });
      return ;
  }

    req.body.userId = user._id;
    req.body.role = user.role;

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;