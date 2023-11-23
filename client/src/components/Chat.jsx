import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const socket = useSocket();
  const params = useParams();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${params.tripId}/chat`,
    )
      .then((response) => response.json())
      .then((data) => setMessages(data.data));
    initWebSocket();
  }, []);

  const initWebSocket = () => {
    socket.emit('joinRoom', { name: user.name, room: +params.tripId });
    socket.on('getMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  };

  const sendMessage = () => {
    const trimmedMessage = messageInput.trim();
    if (trimmedMessage !== '') {
      socket.emit('getMessage', {
        user_id: user.id,
        name: user.name,
        room: +params.tripId,
        message: trimmedMessage,
      });
      setMessageInput('');
    }
  };

  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          {messages.map((message, index) => (
            <p key={index} className="text-gray-700 mb-2">
              {message.name}: {message.message}
            </p>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="輸入訊息"
            className="flex-grow py-2 px-4 border border-gray-300 rounded"
          />
          <button
            className="bg-green-500 text-white py-2 px-4 rounded ml-2"
            onClick={sendMessage}
          >
            傳送
          </button>
        </div>
      </div>
    </>
  );
};

export default Chat;
