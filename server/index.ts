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
import { insertChat } from './models/chat.js';

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
    // io.sockets.to(payload.room).emit('getMessage', {
    //   username: 'server',
    //   message: `${payload.name} joined trip ${payload.room} chat`,
    // });
  });
  socket.on('getMessage', async (payload) => {
    io.sockets.to(payload.room).emit('getMessage', {
      name: payload.name,
      message: payload.message,
    });
    try {
      await insertChat(payload.message, payload.room, payload.user_id);
    } catch (error) {
      console.log(error);
    }
  });
  // Synchronize marking markers on map
  socket.on('getMarker', async (payload) => {
    io.sockets.to(payload.room).emit('getMarker', { room: payload.room, latLng: payload.latLng });
  });
  socket.on('addNewPlaceToTrip', (payload) => {
    io.sockets.to(payload.room).emit('addNewPlaceToTrip', payload);
  });
});

app.use('/api', [userRouter, tripRouter, authRouter]);

app.use(errorHandler);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The Server is listening on port ${port}`);
});
