import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Card } from '@/components/ui/card';
import {
  IoMdSend,
  IoIosChatboxes,
  IoMdCloseCircleOutline,
} from 'react-icons/io';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [answer, setAnswer] = useState('');
  const socket = useSocket();
  const params = useParams();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const ref = useRef(null);

  useEffect(() => {
    // fetch message history
    fetch(
      `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${params.tripId}/chat`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        setMessages(data.data);
      })
      .catch((err) => {
        console.error(err);
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
      message: trimmedMessage,
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
    messages && (
      <Card className="fixed bottom-5 right-14 z-10 max-w-sm rounded-xl">
        <div className="text-white bg-white flex justify-end items-center pr-4 rounded-t-md py-2 text-lg">
          <IoMdCloseCircleOutline
            onClick={onClose}
            className="cursor-pointer text-black"
          />
        </div>
        <div className="pb-2 px-2">
          <ScrollArea className="h-72">
            {messages.map((message, index) => (
              <div key={index} className="flex py-2 pl-2 pr-4">
                <Avatar
                  className={`mr-1 ${
                    +message.user_id === user.id ? 'ml-auto hidden' : ''
                  }`}
                >
                  <AvatarImage src={message.photo} />
                  <AvatarFallback>{message.name[0]}</AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col gap-2 rounded-lg px-3 py-2 text-sm ${
                    message.user_id === user.id
                      ? 'ml-auto text-white bg-gray-800'
                      : 'bg-muted'
                  }`}
                >
                  {message.message}
                </div>
                <div ref={ref}></div>
              </div>
            ))}
          </ScrollArea>
          {answer && (
            <div className="flex py-2 pl-2 pr-4">
              <Avatar className="mr-1">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted">
                {answer}
              </div>
            </div>
          )}

          <div className="flex items-center">
            <Input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="輸入訊息"
              className="flex-grow mr-2"
            />
            <Button
              onClick={sendMessage}
              disabled={messageInput.trim('') === ''}
            >
              <IoMdSend />
            </Button>
          </div>
        </div>
      </Card>
    )
  );
};

const Chat = () => {
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

  const handleChatButtonClick = () => {
    setIsChatWindowOpen(!isChatWindowOpen);
  };

  return (
    <>
      {!isChatWindowOpen && (
        <div
          onClick={handleChatButtonClick}
          className="fixed flex justify-center items-center bottom-5 right-14 z-10 max-w-md px-4 bg-white h-14 w-14 rounded-full cursor-pointer"
        >
          <IoIosChatboxes className=" text-3xl" />
        </div>
      )}
      {isChatWindowOpen && <ChatWindow onClose={handleChatButtonClick} />}
    </>
  );
};

export default Chat;
