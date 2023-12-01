import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [answer, setAnswer] = useState('');
  const socket = useSocket();
  const params = useParams();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // fetch message history
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${params.tripId}/chat`,
    )
      .then((response) => response.json())
      .then((data) => {
        setMessages(data.data);
      });

    socket.emit('newUserInRoom', { name: user.name, room: params.tripId });
    socket.on('newChatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('newChatMessage');
    };
  }, []);

  const sendPromptToServerToGPT = async () => {
    try {
      const userPrompt = messageInput.replace('/ai', '');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${
          params.tripId
        }/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ userPrompt }),
        },
      );
      if (!response.ok || !response.body) {
        throw response.statusText;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const isReceiving = true;

      while (isReceiving) {
        const { value, done } = await reader.read();
        if (done) break;
        const decodedChunk = decoder.decode(value, { stream: true });
        setAnswer((answer) => answer + decodedChunk);
      }

      setAnswer('');
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    const trimmedMessage = messageInput.trim();

    const newChatMessage = {
      user_id: user.id,
      name: user.name,
      room: params.tripId,
      message: messageInput.trim(),
    };

    if (trimmedMessage !== '') {
      socket.emit('newChatMessage', newChatMessage);
      setMessages((prevMessages) => [...prevMessages, newChatMessage]);
    }

    if (trimmedMessage.startsWith('/ai')) sendPromptToServerToGPT();
    setMessageInput('');
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
    <div className="fixed bottom-0 right-0 z-10 max-w-md p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="mb-4">
        {messages.map((message, index) => (
          <p key={index} className="text-gray-700 mb-2">
            {message.name}: {message.message}
          </p>
        ))}
        <p className="text-gray-700 mb-2">{answer}</p>
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
  );
};

export default Chat;
