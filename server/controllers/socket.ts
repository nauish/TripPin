import { ServerOptions, Socket, Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { insertChat } from '../models/chat.js';
import { getCacheInstance } from '../models/cache.js';
import { verifyJWT } from '../middleware/authentication.js';
import { Lock } from '../types/trip.js';

let io: SocketServer;

function handleGeneralSocketEvents(socket: Socket, userId: number) {
  socket.on('newUserInRoom', (payload) => {
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
      console.error(error);
    }
  });

  socket.on('getMarker', async (payload) => {
    socket.to(payload.room).emit('getMarker', { room: payload.room, latLng: payload.latLng });
  });
  socket.on('addNewPlaceToTrip', async (payload) => {
    socket.to(payload.room).emit('addNewPlaceToTrip', true);
  });

  socket.on('disconnecting', () => {
    const rooms = socket.rooms.keys();
    rooms.next(); // Skip the first key
    const room = rooms.next().value;
    socket.to(room).emit('userDisconnected', { userId });
  });
}

function handleLocks(socket: Socket, userId: number) {
  socket.on('getRoomLocks', async (payload) => {
    const { room } = payload;
    const lockKey = `editLock:${room}:*`;
    try {
      const locks: Lock[] = [];
      const cache = getCacheInstance();

      if (!cache) throw new Error('Redis is down');
      const lockKeys = await cache.keys(lockKey);
      let lockValues: (string | null)[];
      if (lockKeys.length > 0) lockValues = await cache.mget(...lockKeys);
      lockKeys.forEach((key, index) => {
        const placeId = key.split(':')[2];
        locks.push({ placeId, name: lockValues[index] });
      });
      io.to(socket.id).emit('getRoomLocks', { locks });
    } catch (error) {
      io.to(socket.id).emit('getRoomLocks', { locks: [] });
    }
  });

  socket.on('newEditLock', async (payload) => {
    const { room, placeId, name } = payload;
    const lockKey = `editLock:${room}:${placeId}`;
    const LOCK_EXPIRE_TIME = 60;

    try {
      const cache = getCacheInstance();
      if (!cache) throw new Error('Redis is down');

      const isLockAcquired = await cache.set(lockKey, name, 'EX', LOCK_EXPIRE_TIME, 'NX');
      if (!isLockAcquired) {
        io.sockets.to(room).emit('newEditLock', {});
        return;
      }

      io.sockets.to(room).emit('newEditLock', { name, userId, placeId });
    } catch (error) {
      console.error('Redis is down:', error);
      io.sockets.to(room).emit('newEditLock', { name, userId, placeId });
    }
  });

  socket.on('extendEditLock', async (payload) => {
    const { room, placeId } = payload;
    console.log('extendEditLock', payload);
    const lockKey = `editLock:${room}:${placeId}`;
    const LOCK_EXPIRE_TIME = 60;

    try {
      const cache = getCacheInstance();
      if (!cache) throw new Error('Redis is down');
      await cache.expire(lockKey, LOCK_EXPIRE_TIME);
    } catch (error) {
      console.error('Redis is down:', error);
    }
  });

  socket.on('newEditUnlock', async (payload) => {
    const { room, placeId } = payload;
    const lockKey = `editLock:${room}:${placeId}`;

    try {
      const cache = getCacheInstance();
      if (!cache) throw new Error('Redis is down');
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

export function initSocketIO(server: HttpServer, options?: Partial<ServerOptions>) {
  io = new SocketServer(server, options);
  io.use(async (socket, next) => {
    try {
      const { token } = socket.handshake.auth;
      const decoded = token && (await verifyJWT(token));

      if (!token || !decoded) return next(new Error('Authentication error'));

      // eslint-disable-next-line no-param-reassign
      socket.data = decoded;
      return next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.data;
    handleGeneralSocketEvents(socket, userId);
    handleLocks(socket, userId);
  });
  return io;
}

export default function getSocketIOInstance() {
  if (!io) throw new Error('SocketIO instance has not been initialized.');
  return io;
}
