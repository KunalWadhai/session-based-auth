import dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const JWT_TOKEN = process.env.JWT_TOKEN;
export const MONGODB_URI = process.env.MONGODB_URI;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
