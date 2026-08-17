import { Response, CookieOptions } from "express";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

// FIX: dynamic sameSite
const SAME_SITE: CookieOptions["sameSite"] = isProd ? "none" : "lax";

// Set App Cookie
export function setAppCookie(
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  const cookieDomain = isProd ? process.env.COOKIE_DOMAIN : undefined;

  const baseOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd, 
    sameSite: SAME_SITE,
    path: "/",
    ...options,
  };

  if (isProd && cookieDomain) baseOptions.domain = cookieDomain;

  res.cookie(name, value, baseOptions);
}