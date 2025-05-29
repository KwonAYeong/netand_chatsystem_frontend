// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/chat';
const App = () => {
  return (
    <Router>
      {/* 전역 레이아웃이 필요하면 여기에 Header, Sidebar 등 넣어 */}
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<Chat />} />
        {/* 다른 라우트 생기면 여기 추가 */}
      </Routes>
    </Router>
  );
};

export default App;
