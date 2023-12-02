import { Server } from 'socket.io';

let io: Server;

export function initSocketIO(server: any, options?: any) {
  io = new Server(server, options);
  return io;
}

export function getSocketIOInstance() {
  if (!io) {
    throw new Error('SocketIO instance has not been initialized.');
  }
  return io;
}

export default getSocketIOInstance;
