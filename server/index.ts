import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initSocketIO } from './socketServer.js';
import userRouter from './routes/userRouter.js';
import authRouter from './routes/authRouter.js';
import tripRouter from './routes/tripRouter.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocketIO(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api', [userRouter, tripRouter, authRouter]);

app.use(errorHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`The Server is listening on port ${port}`);
});
