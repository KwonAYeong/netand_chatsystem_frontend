// src/components/panel/InviteMoreModal.tsx
import { useState } from 'react';
import { api } from '../../api/axios';

interface Props {
  roomId: number;
  onClose: () => void;
  onInvited: () => void; // ✅ 초대 완료 후 실행될 콜백
}

export default function InviteMoreModal({ roomId, onClose, onInvited }: Props) {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (emails.includes(trimmed)) return alert('이미 추가된 이메일입니다.');
    setEmails((prev) => [...prev, trimmed]);
    setEmail('');
  };

  const handleRemove = (target: string) => {
    setEmails((prev) => prev.filter((e) => e !== target));
  };

  const handleSubmit = async () => {
    if (emails.length === 0) return alert('최소 1명 이상 입력하세요.');
    try {
      setLoading(true);
      await api.post(`/chat/group/${roomId}/invite`, { emails });
      alert('초대 성공!');
      onInvited(); // ✅ 멤버 새로고침 콜백 실행
      onClose();   // ✅ 모달 닫기
    } catch (err) {
      console.error('❌ 초대 실패:', err);
      alert('초대 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">참여자 초대</h2>

        <div className="flex gap-2 mb-3">
          <input
            type="email"
            className="border px-2 py-1 flex-1 rounded"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            disabled={loading}
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={handleAdd}
            disabled={loading}
          >
            추가
          </button>
        </div>

        <ul className="mb-4 max-h-32 overflow-y-auto text-sm">
          {emails.map((e) => (
            <li key={e} className="flex justify-between items-center border-b py-1">
              {e}
              <button
                className="text-red-500 text-xs"
                onClick={() => handleRemove(e)}
                disabled={loading}
              >
                제거
              </button>
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-1 border rounded"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="bg-green-600 text-white px-4 py-1 rounded"
            onClick={handleSubmit}
            disabled={loading}
          >
            초대
          </button>
        </div>
      </div>
    </div>
  );
}
