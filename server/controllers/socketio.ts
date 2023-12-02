import { insertChat } from '../models/chat.js';
import getSocketIOInstance from '../socketServer.js';

const io = getSocketIOInstance();

io.on('connection', (socket) => {
  socket.on('newUserInRoom', (payload) => socket.join(payload.room));
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
    socket.to(payload.room).emit('newEditLock', payload);
  });
});
