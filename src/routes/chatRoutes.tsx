import { Routes, Route } from 'react-router-dom';
import ChatPage from '../pages/chat';

const ChatRoutes = () => {
  return (
    <Routes>
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
};

export default ChatRoutes;
