'use client';
import { Content } from '@google/generative-ai';
import { Cross1Icon, ReloadIcon } from '@radix-ui/react-icons';
import { usePathname } from 'next/navigation'; // Để ẩn trên trang admin
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useChat } from '@/shared/contexts';
import { cn } from '@/shared/utils';

import { Button } from '@/shared/components/ui';
import { ShineBorder } from '@/shared/components/ui/shine-border';
import Image from 'next/image';
import { askChatbot } from '../actions';

const ChatWidget = () => {
  const {
    addMessage,
    clearChat,
    isBotTyping,
    messages,
    setIsBotTyping,
    updateBotMessage, // Lấy hàm clearChat
  } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith('/manage');

  const getGeminiHistory = useCallback((): Content[] => {
    return messages
      .filter((message) => !message.isLoading && message.text.trim() !== '')
      .map((message) => ({
        role: message.sender === 'user' ? 'user' : 'model',
        parts: [{ text: message.text }],
      }));
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    // Thêm optional cho event
    if (e) e.preventDefault();
    if (!inputValue.trim() || isBotTyping) return;

    const currentUserQuery = inputValue;
    const historyForGemini = getGeminiHistory().slice(-10); // Lấy lịch sử TRƯỚC KHI thêm tin nhắn hiện tại

    addMessage(currentUserQuery, 'user');
    setInputValue('');
    setIsBotTyping(true);
    const botMessageId = addMessage('Đang tìm câu trả lời...', 'bot', true);

    try {
      const response = await askChatbot(currentUserQuery, historyForGemini);

      if (response.success && response.answer) {
        updateBotMessage(botMessageId, response.answer, false);
      } else {
        updateBotMessage(
          botMessageId,
          response.message || 'Xin lỗi, tôi không thể xử lý yêu cầu này.',
          false,
        );
      }
    } catch (error) {
      updateBotMessage(
        botMessageId,
        'Đã có lỗi kết nối. Vui lòng thử lại sau.',
        false,
      );
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleClearChat = () => {
    clearChat(); // Gọi hàm từ context
    addMessage(
      'Chào bạn! Tôi là Ucademy Bot. Tôi có thể giúp gì cho bạn?',
      'bot',
    ); // Tin nhắn chào mừng mới
  };

  // Không render nếu là trang admin
  if (isAdminPage) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        aria-label="Mở Chatbot Ucademy"
        className="fixed bottom-6 right-6 z-[100] size-12 animate-bounce rounded-full bg-primary shadow-lg hover:animate-none"
        onClick={() => setIsOpen(true)}
      >
        <Image
          alt="Ucademy Bot"
          className="h-full w-full rounded-full object-cover"
          height={100}
          src={`/bot-logo.jpg`}
          width={100}
        />
      </button>
    );
  }

  return (
    <div className="bgDarkMode borderDarkMode fixed bottom-6 right-6 z-[100] flex h-[calc(100vh-100px)] max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-lg shadow-2xl md:bottom-8 md:right-8 md:max-h-[650px]">
      <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />

      <div className="bg-muted/40 flex items-center justify-between space-y-1.5 border-b bg-primary p-3.5 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage
              alt="Ucademy Bot"
              src="/bot-logo.jpg"
            />
            <AvatarFallback>
              <Image
                alt="Ucademy Bot"
                className="h-full w-full rounded-full object-cover"
                height={14}
                src={`/logo.png`}
                width={14}
              />
            </AvatarFallback>
          </Avatar>
          <h3 className="text-md font-semibold">Ucademy Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Làm mới cuộc trò chuyện"
            className="size-8"
            size="icon"
            variant="ghost"
            onClick={handleClearChat}
          >
            <ReloadIcon className="size-4" />
          </Button>
          <Button
            aria-label="Đóng Chatbot"
            className="size-8"
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <Cross1Icon className="size-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-[#F8F9FA] p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2.5',
                message.sender === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {message.sender === 'bot' && (
                <Avatar className="size-7 shrink-0 self-start">
                  <AvatarImage
                    alt="Bot"
                    src="/logo-ucademy.png"
                  />
                  <AvatarFallback>
                    <Image
                      alt="Ucademy Bot"
                      className="h-full w-full rounded-full object-cover"
                      height={14}
                      src={`/bot-logo.jpg`}
                      width={14}
                    />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] break-words rounded-2xl px-3.5 py-2.5 text-sm shadow-sm md:max-w-[80%]',
                  message.sender === 'user'
                    ? 'rounded-br-md bg-primary text-sm text-white'
                    : 'text-foreground rounded-bl-md bg-white text-[#202124] shadow-sm',
                  message.isLoading && 'animate-pulse_custom italic opacity-60', // Thêm class animate-pulse_custom
                )}
              >
                {message.isLoading
                  ? message.text // "Đang suy nghĩ..."
                  : message.text.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < message.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
              </div>
              {message.sender === 'user' && (
                <Avatar className="size-7 shrink-0 self-start">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
        <div
          ref={messagesEndRef}
          className="h-1"
        />
      </ScrollArea>

      <form
        className="flex items-center border-t border-slate-200 bg-white px-4 py-3"
        onSubmit={handleSubmit}
      >
        <Input
          className="dark:b:bg-slate-400 flex-1 rounded-3xl border-slate-100 bg-[#F8F9FA] px-4 py-3 text-sm font-normal text-[#202124] dark:bg-[#F8F9FA] dark:disabled:bg-slate-200"
          disabled={isBotTyping}
          placeholder="Hỏi Ucademy Bot..."
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isBotTyping) {
              handleSubmit(e as any);
            }
          }}
        />
        <button className="ml-2 flex size-10 items-center justify-center rounded-full text-primary hover:bg-primary hover:bg-opacity-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
