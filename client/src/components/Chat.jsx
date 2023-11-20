import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const socket = useSocket();
  const params = useParams();
  const user = JSON.parse(localStorage.getItem('user'));

  const connectToWebSocket = () => {
    setWs(socket);
  };

  useEffect(() => {
    if (ws) {
      console.log('Connect to WS server successfully!');
      initWebSocket();
    }
  }, [ws]);

  const initWebSocket = () => {
    ws.emit('joinRoom', { name: user.name, room: +params.tripId });
    ws.on('getMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      console.log(message);
    });
  };

  const sendMessage = () => {
    const trimmedMessage = messageInput.trim();
    if (trimmedMessage !== '') {
      ws.emit('getMessage', {
        username: user.name,
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
              {message.username}: {message.message}
            </p>
          ))}
        </div>
        <div className="flex items-center">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
            onClick={connectToWebSocket}
          >
            連線
          </button>
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
