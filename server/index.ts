import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRouter from './routes/userRouter.js';
import authRouter from './routes/authRouter.js';
import tripRouter from './routes/tripRouter.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {},
});
const port = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

io.on('connection', (socket) => {
  socket.on('joinRoom', (payload) => {
    socket.join(payload.room);
    io.sockets.to(payload.room).emit('getMessage', {
      username: 'server',
      message: `${payload.name} joined trip ${payload.room} chat`,
    });
  });
  socket.on('getMessage', (payload) => {
    io.sockets.to(payload.room).emit('getMessage', {
      username: payload.username,
      message: payload.message,
    });
  });
});

app.use('/api', [userRouter, tripRouter, authRouter]);

app.use(errorHandler);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The Server is listening on port ${port}`);
});
