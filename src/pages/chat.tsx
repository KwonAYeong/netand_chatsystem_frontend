
import ChatLayout from '../components/layout/ChatLayout';
import { ChatUIProvider } from '../hooks/useChatUI';

const ChatPage = () => {
  return (
    <ChatUIProvider>
      <ChatLayout />
    </ChatUIProvider>
  );
};

export default ChatPage;
