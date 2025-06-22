// src/components/panel/InviteChannel.tsx
import { useState } from 'react';
import { api } from '../../api/axios';

interface Props {
  senderId: number;
  onCreated: (newRoom: { chatRoomId: number; chatRoomName: string }) => void;
  existingRooms: { chatRoomName: string }[];
  onClose: () => void;
  fetchChannelRooms: () => Promise<void>; // ✅ 추가됨
}

export default function InviteChannel({
  senderId,
  onCreated,
  existingRooms,
  onClose,
  fetchChannelRooms, // ✅ 추가됨
}: Props) {
  const [channelName, setChannelName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());

  const handleAddEmail = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!isEmailValid(email)) return alert('유효한 이메일을 입력해주세요.');
    if (invitedEmails.includes(email)) return alert('이미 추가된 이메일입니다.');
    setInvitedEmails((prev) => [...prev, email]);
    setInviteEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setInvitedEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleCreate = async () => {
    if (!channelName.trim()) return alert('채널명을 입력해주세요.');
    if (invitedEmails.length < 2) return alert('최소 2명 이상 초대해야 그룹 채팅이 가능합니다.');
    if (existingRooms.some((r) => r.chatRoomName === channelName.trim())) {
      return alert('이미 존재하는 채널명입니다.');
    }

    setLoading(true);
    try {
      const res = await api.post('/chat/group', {
        chatRoomName: channelName.trim(),
        participantEmails: invitedEmails,
      });

      const newRoom = res.data;

      await fetchChannelRooms(); // ✅ 생성 후 목록 즉시 반영

      alert('✅ 그룹 채팅방이 생성되었습니다!');
      onCreated(newRoom);
      onClose();
    } catch (err: any) {
      console.error('❌ 생성 실패:', err);
      alert(err.response?.data?.message || '채팅방 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] shadow">
        <h2 className="text-xl font-bold mb-4">그룹 채팅방 생성하기</h2>

        <label className="block text-sm mb-1">채널명</label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          className="w-full px-3 py-2 rounded mb-4 bg-gray-100"
          placeholder="채널명 입력"
        />

        <label className="block text-sm mb-1">초대 이메일</label>
        <div className="flex gap-2 mb-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-gray-100"
            placeholder="이메일 입력"
          />
          <button
            onClick={handleAddEmail}
            disabled={!inviteEmail.trim()}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            확인
          </button>
        </div>

        <div className="border rounded bg-white max-h-40 overflow-y-auto text-sm">
          {invitedEmails.map((email) => (
            <div key={email} className="flex justify-between items-center px-3 py-2 border-b">
              <span>{email}</span>
              <button
                onClick={() => handleRemoveEmail(email)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="text-gray-600 hover:underline">
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={!channelName.trim() || invitedEmails.length < 2 || loading}
            className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? '생성 중...' : '채팅방 생성'}
          </button>
        </div>
      </div>
    </div>
  );
}
