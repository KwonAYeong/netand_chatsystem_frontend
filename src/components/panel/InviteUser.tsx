import { useState } from 'react';
import { api } from '../../api/axios';

interface ChatRoom {
  chatRoomId: number;
  chatRoomName: string;
  receiverProfileImage: string;
}

interface Props {
  senderId: number;
  onCreated?: (newRoom: ChatRoom) => void;
  existingRooms: ChatRoom[];
}

export default function InviteUser({ senderId, onCreated, existingRooms }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    const enteredEmail = email.trim().toLowerCase();
    if (!enteredEmail) {
      alert('이메일을 입력해주세요.');
      return;
    }

    const alreadyExists = existingRooms.some(
      (room) => room.chatRoomName.toLowerCase() === enteredEmail
    );

    if (alreadyExists) {
      alert('이미 초대된 사용자입니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/chat/dm', {
        senderId,
        receiverEmail: enteredEmail,
      });

      const newRoom = res.data;

      alert('✅ 채팅방이 생성되었습니다!');
      setShowModal(false);
      setEmail('');

      onCreated?.({
        chatRoomId: newRoom.chatRoomId,
        chatRoomName: newRoom.chatRoomName,
        receiverProfileImage: newRoom.receiverProfileImage || '',
      });
    } catch (err: any) {
      console.error('❌ 채팅방 생성 실패:', err);
      alert(err.response?.data?.message || '채팅방 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-gray-600 hover:text-blue-600"
      >
        ➕ 사용자 초대
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">다이렉트 메시지 시작하기</h2>

            <label className="block mb-2 text-sm">초대할 이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
              disabled={loading}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:underline"
                disabled={loading}
              >
                취소
              </button>
              <button
                onClick={handleInvite}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '생성 중...' : '채팅방 생성하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
