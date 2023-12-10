import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import authRouter from './routes/authRouter.js';
import tripRouter from './routes/tripRouter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocketIO } from './controllers/socketio.js';
import rateLimiter from './middleware/rateLimiter.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
initSocketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use('/api', rateLimiter, [userRouter, tripRouter, authRouter]);

app.use(express.static('public'));

app.get('/*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.use(errorHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`The Server is listening on port ${port}`);
});
