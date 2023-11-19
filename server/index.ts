import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRouter from './routes/userRouter.js';
import authRouter from './routes/authRouter.js';
import tripRouter from './routes/tripRouter.js';
import placeRouter from './routes/placeRouter.js';
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
  socket.on('joinRoom', (room) => {
    socket.join(room);
    io.sockets.to(room).emit('getMessage', `A user joined room ${room}`);
  });
  socket.on('getMessage', (message) => {
    io.sockets.to(message.room).emit('getMessage', message.message);
  });
});

app.use('/api', [userRouter, tripRouter, authRouter, placeRouter]);

app.use(errorHandler);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The Server is listening on port ${port}`);
});
