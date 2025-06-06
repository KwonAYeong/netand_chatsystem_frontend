import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';

interface ChatRoom {
  chatRoomId: number;
  targetUserId: number;
  targetUserName: string;
}

export default function DMList() {
  const { setCurrentRoomId, setCurrentRoomName, currentRoomId } = useChat();
  const { user } = useUser();
  const [dmList, setDmList] = useState<ChatRoom[]>([]);

  // ✅ DM 목록 불러오기
  useEffect(() => {
    if (!user?.userId) return;

    const fetchDMList = async () => {
      try {
        const res = await axios.get(`/chat/dm/list/${user.userId}`);
        setDmList(res.data); // 백엔드 응답 형식에 맞게
      } catch (err) {
        console.error('DM 목록 불러오기 실패:', err);
      }
    };

    fetchDMList();
  }, [user]);

  // ✅ DM 채팅방 선택 or 생성
  const handleSelectUser = async (targetUserId: number, targetUserName: string) => {
    if (!user) return;

    try {
      const res = await axios.post('/chat/dm', {
        userAId: user.userId,
        userBId: targetUserId,
      });
      const chatRoomId = res.data;
      setCurrentRoomId(String(chatRoomId));
      setCurrentRoomName(targetUserName);
    } catch (err) {
      console.error('DM 채팅방 생성/조회 실패:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">다이렉트 메세지</h2>
      <ul>
        {dmList.map((dm) => (
          <li
            key={dm.chatRoomId}
            className={`cursor-pointer p-2 rounded hover:bg-purple-100 ${
              currentRoomId === String(dm.chatRoomId) ? 'bg-purple-200' : ''
            }`}
            onClick={() => handleSelectUser(dm.targetUserId, dm.targetUserName)}
          >
            {dm.targetUserName}
          </li>
        ))}
      </ul>
    </div>
  );
}
