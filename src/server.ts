import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express, { Request, Response, NextFunction, CookieOptions } from "express";
import corsMiddleware from "./middlewares/cors";
import { connectDB } from "./config/Db";
import limiter from "./middlewares/rateLimiter";
import dotenv from "dotenv";
dotenv.config();
import securityMiddleware from "./middlewares/security";
import logger from "./middlewares/logger";
import session from "express-session";
import cookieParser from "cookie-parser";
import "./config/passport";
import passport from "passport";
import path from "path";
import apiRouter from "./apis/apiRouter";
import courseRouter from "./routes/CourseRoute";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

const app = express();
const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const isProd = process.env.NODE_ENV === "production";
  const SAME_SITE: CookieOptions["sameSite"] = isProd ? "none" : "lax";

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret-key",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        touchAfter: 24 * 3600,
      }),
      cookie: {
        httpOnly: true,
        secure: isProd,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: SAME_SITE,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`Request: ${req.method} ${req.url}`);
    next();
  });

  app.use(securityMiddleware);
  app.get("/", (req:Request, res:Response)=>{
    res.send("The School backend server is active");
  })
  app.use("/images", express.static(path.join(__dirname, "../uploads")));
  app.use("/api/design", courseRouter);
  app.use(limiter);
  app.use("/api", apiRouter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: "Endpoint not found" });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err.stack);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  });

  if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  }
};

startServer();

export default app;