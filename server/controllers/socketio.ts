import { Socket, Server } from 'socket.io';
import { insertChat } from '../models/chat.js';
import { getCacheInstance } from '../models/cache.js';

let io: Server;
const cache = await getCacheInstance();

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

  socket.on('newEditLock', async (payload) => {
    const { room, placeId } = payload;
    const lockKey = `editLock:${room}:${placeId}`;
    const LOCK_EXPIRE_TIME = 60;

    await cache.set(lockKey, '1', 'EX', LOCK_EXPIRE_TIME);
    const lockKeys = (await cache.keys(`editLock:${room}:*`)) ?? [];
    const locks = lockKeys.map((key) => key.split(':')[2]);

    socket.to(room).emit('editLocks', { locks });
  });

  socket.on('newEditUnlock', async (payload) => {
    const { room, placeId } = payload;
    const lockKey = `editLock:${room}:${placeId}`;
    await cache.del(lockKey);
    const locks = ((await cache.keys(`editLock:${room}:*`)) ?? []).map((key) => key.split(':')[2]);
    socket.to(room).emit('editLocks', { locks });
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
