import express from "express";
//import BotChat from "../controllers/BotController";
const BotRouter = express.Router();
import { Request, Response, NextFunction } from "express";

const validateRequest = (req:Request, res:Response, next:NextFunction): void => {
    const { message, language } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Valid 'message' is required." });
      return;
    }
    if (language && typeof language !== "string") {
      res.status(400).json({ error: "Language must be a string." });
      return;
    }
    next();
  };
  

BotRouter.post("/bot", validateRequest);

export default BotRouter;