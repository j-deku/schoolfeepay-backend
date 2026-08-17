import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const allowed = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  process.env.ADMIN_URL,
  process.env.VERCEL_BACKEND_URL,
  process.env.VERCEL_FRONTEND_URL,
  'http://localhost',
  /\.ngrok-free\.app$/,
].filter((v): v is string | RegExp => Boolean(v));

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (
      !origin ||
      allowed.some((rule) =>
        rule instanceof RegExp ? rule.test(origin) : rule === origin
      )
    ) {
      console.log(`CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`CORS denied for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;