// shared/contexts/ChatContext.tsx
'use client';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

export interface ChatMessage {
  // Export để ChatWidget có thể dùng
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (
    text: string,
    sender: 'user' | 'bot',
    isLoading?: boolean,
  ) => string;
  updateBotMessage: (id: string, text: string, isLoading: boolean) => void;
  isBotTyping: boolean;
  setIsBotTyping: Dispatch<SetStateAction<boolean>>;
  clearChat: () => void; // Thêm hàm xóa chat
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);

  if (!context) throw new Error('useChat must be used within a ChatProvider');

  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const addMessage = (
    text: string,
    sender: 'user' | 'bot',
    isLoading = false,
  ): string => {
    const newMessageId = `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newMessage: ChatMessage = {
      id: newMessageId,
      text,
      sender,
      timestamp: new Date(),
      isLoading,
    };

    setMessages((previous) => [...previous, newMessage]);

    return newMessageId;
  };

  const updateBotMessage = (
    idToUpdate: string,
    newText: string,
    newIsLoading: boolean,
  ) => {
    setMessages((previousMessages) =>
      previousMessages.map((message) =>
        message.id === idToUpdate
          ? {
              ...message,
              text: newText,
              isLoading: newIsLoading,
              timestamp: new Date(),
            }
          : message,
      ),
    );
  };

  const clearChat = () => {
    setMessages([]);
    setIsBotTyping(false);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        updateBotMessage,
        isBotTyping,
        setIsBotTyping,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
