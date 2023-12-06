import { Socket, Server } from 'socket.io';
import { insertChat } from '../models/chat.js';

let io: Server;

function socketEvents(socket: Socket) {
  socket.on('newUserInRoom', (payload) => {
    console.log('newUserInRoom', payload);
    socket.join(payload.room);
  });

  socket.on('newChatMessage', async (payload) => {
    socket.to(payload.room).emit('newChatMessage', {
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
    console.log(payload);
    socket.to(payload.room).emit('getMarker', { room: payload.room, latLng: payload.latLng });
  });
  socket.on('addNewPlaceToTrip', (payload) => {
    socket.to(payload.room).emit('addNewPlaceToTrip', payload);
  });

  socket.on('newEditLock', (payload) => {
    console.log('newEditLock', payload);
    socket.to(payload.room).emit('newEditLock', payload);
  });

  socket.on('newEditUnlock', (payload) => {
    console.log('newEditUnLock', payload);
    socket.to(payload.room).emit('newEditUnlock', payload);
  });
}

export function initSocketIO(server: any, options?: any) {
  io = new Server(server, options);
  io.on('connection', (socket) => {
    socketEvents(socket);
  });
  return io;
}

export default function getSocketIOInstance() {
  if (!io) throw new Error('SocketIO instance has not been initialized.');
  return io;
}
