import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { MessageCircle, Send, X } from 'lucide-react';
import { Textarea } from './ui/textarea';

const Chat = ({ attendeeRole, socket }) => {
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState('');
  const { tripId } = useParams();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const ref = useRef(null);

  useEffect(() => {
    if (attendeeRole !== 'attendee') return;

    fetch(`${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/chat`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw response.statusText;
        return response.json();
      })
      .then((data) => {
        setMessages(data?.data);
        if (data.error) {
          setError(data.error);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      });

    socket &&
      socket.on('newChatMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

    return () => {
      socket && socket.off('newChatMessage');
    };
  }, [attendeeRole]);

  useEffect(() => {
    if (isChatWindowOpen && !error && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isChatWindowOpen, messages, error]);

  const sendPromptToServerToGPT = async () => {
    try {
      const userPrompt = messageInput.replace('/ai', '');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_HOST}api/v1/trips/${tripId}/chat`,
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
      room: tripId,
      message: trimmedMessage,
    };

    if (trimmedMessage !== '') {
      socket && socket.emit('newChatMessage', newChatMessage);
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

  const handleChatButtonClick = () => {
    setIsChatWindowOpen(!isChatWindowOpen);
  };

  return (
    <>
      {attendeeRole === 'attendee' && !isChatWindowOpen && (
        <div
          onClick={handleChatButtonClick}
          className="border-gray-300 border-2 fixed flex justify-center items-center 
                        bottom-5 right-14 z-10 max-w-md px-4 bg-white 
                        h-14 w-14 rounded-full cursor-pointer"
        >
          <MessageCircle />
        </div>
      )}

      {isChatWindowOpen && (
        <Card className="fixed bottom-5 right-14 z-10 max-w-sm rounded-xl">
          <div className="text-white bg-white flex justify-end items-center pr-4 rounded-t-md py-2 text-lg">
            <X
              onClick={handleChatButtonClick}
              className="cursor-pointer text-black"
            />
          </div>
          <div className="pb-2 px-2 ">
            <ScrollArea className="h-72">
              {messages &&
                messages.map((message, index) => (
                  <div key={index} className="flex py-2 pl-2 pr-4 ">
                    <Avatar
                      className={`mr-1 ${
                        +message.user_id === user.id ? 'ml-auto hidden' : ''
                      }`}
                    >
                      <AvatarImage src={message.photo} />
                      <AvatarFallback>{message.name[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`break-word flex gap-2 rounded-lg px-3 py-2 text-sm ${
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

            <div className="flex items-center mt-2">
              <Textarea
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="輸入 /ai 來跟 AI 對話"
                className="min-h-[40px] mr-2"
              />
              <Button
                onClick={sendMessage}
                disabled={messageInput.trim() === ''}
              >
                <Send />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chat;
