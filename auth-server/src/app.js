import express from 'express';
import router from './routes/index.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { CORS_ORIGIN } from './constants.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use('/api/v1', router);

app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Server is healthy'
    });
});

export default app;