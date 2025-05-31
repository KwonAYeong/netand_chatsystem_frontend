import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/chat';
import { UserProvider } from './context/UserContext'; 

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
