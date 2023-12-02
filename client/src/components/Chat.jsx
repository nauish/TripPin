import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Card } from '@/components/ui/card';
import { IoMdSend } from 'react-icons/io';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';

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
    <Card className="fixed bottom-0 right-0 z-10 max-w-md p-4 rounded-lg shadow-sm">
      {messages.map((message, index) => (
        <div key={index} className="flex space-y-4">
          <div></div>
          <Avatar
            className={`mr-1 ${
              +message.user_id === user.id ? 'ml-auto hidden' : ''
            }`}
          >
            <AvatarImage src={message.photo} />
            <AvatarFallback>{message.name}</AvatarFallback>
          </Avatar>
          <div
            className={`flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${
              +message.user_id === user.id
                ? 'ml-auto text-white bg-gray-800'
                : 'bg-muted'
            }`}
          >
            {message.message}
          </div>
        </div>
      ))}
      <p className="text-gray-700 mb-2">{answer}</p>

      <div className="flex items-center">
        <Input
          type="text"
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="輸入訊息"
          className="flex-grow mr-2"
        />
        <Button onClick={sendMessage} disabled={messageInput.trim('') === ''}>
          <IoMdSend />
        </Button>
      </div>
    </Card>
  );
};

export default Chat;
