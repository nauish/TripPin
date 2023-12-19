import { Socket, Server } from 'socket.io';
import { insertChat } from '../models/chat.js';
import { getCacheInstance } from '../models/cache.js';
import { verifyJWT } from '../middleware/authentication.js';

let io: Server;
const cache = getCacheInstance();

function socketEvents(socket: Socket) {
  const { userId } = socket.data;

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
    socket.to(payload.room).emit('getMarker', { room: payload.room, latLng: payload.latLng });
  });
  socket.on('addNewPlaceToTrip', async (payload) => {
    socket.to(payload.room).emit('addNewPlaceToTrip', true);
  });

  socket.on('getRoomLocks', async (payload) => {
    const { room } = payload;
    const lockKey = `editLock:${room}:*`;
    try {
      const locks: any[] = [];
      const lockKeys = await cache.keys(lockKey); // key: editLock:room:placeId, value: name
      let lockValues: any[] = [];
      if (lockKeys.length > 0) {
        lockValues = await cache.mget(...lockKeys);
      }
      lockKeys.forEach((key, index) => {
        const placeId = key.split(':')[2];
        locks.push({ placeId, name: lockValues[index] });
      });
      io.to(socket.id).emit('getRoomLocks', { locks });
    } catch (error) {
      console.error('Redis is down:', error);
      io.to(socket.id).emit('getRoomLocks', { locks: [] });
    }
  });

  socket.on('newEditLock', async (payload) => {
    const { room, placeId, name } = payload;
    const lockKey = `editLock:${room}:${placeId}`;
    const LOCK_EXPIRE_TIME = 60;

    try {
      const isLockAcquired = await cache.set(lockKey, name, 'EX', LOCK_EXPIRE_TIME, 'NX');
      if (isLockAcquired) {
        io.sockets.to(room).emit('newEditLock', { name, userId, placeId });

        setTimeout(async () => {
          try {
            cache.del(lockKey);
            io.sockets.to(room).emit('newEditUnlock', { placeId });
          } catch (error) {
            console.error('Redis is down:', error);
          }
        }, LOCK_EXPIRE_TIME * 1000);
        return;
      }
      io.sockets.to(room).emit('newEditLock', {});
    } catch (error) {
      console.error('Redis is down:', error);
      io.sockets.to(room).emit('newEditLock', { name, userId, placeId });
    }
  });

  socket.on('newEditUnlock', async (payload) => {
    const { room, placeId } = payload;
    const lockKey = `editLock:${room}:${placeId}`;

    try {
      await cache.del(lockKey);
    } catch (error) {
      console.error('Redis is down:', error);
    } finally {
      io.sockets.to(room).emit('newEditUnlock', { placeId });
    }
  });

  socket.on('disconnecting', () => {
    const rooms = socket.rooms.keys();
    rooms.next(); // Skip the first key
    const room = rooms.next().value;
    socket.to(room).emit('userDisconnected', { userId });
  });
}

export function initSocketIO(server: any, options?: any) {
  io = new Server(server, options);
  io.use(async (socket, next) => {
    try {
      const { token } = socket.handshake.auth;
      if (!token) return next(new Error('Authentication error'));

      const decoded = await verifyJWT(token);
      if (!decoded) return next(new Error('Authentication error'));

      // eslint-disable-next-line no-param-reassign
      socket.data = decoded;
      return next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socketEvents(socket);
  });
  return io;
}

export default function getSocketIOInstance() {
  if (!io) throw new Error('SocketIO instance has not been initialized.');
  return io;
}
