// src/components/panel/InviteMoreModal.tsx

import React, { useState } from 'react';
import { inviteToGroupChat } from '../../api/chat';
import { X } from 'lucide-react';

interface InviteMoreModalProps {
  chatRoomId: number;
  onClose: () => void;
  onInvited?: () => void;
}

export default function InviteMoreModal({
  chatRoomId,
  onClose,
  onInvited,
}: InviteMoreModalProps) {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddEmail = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (emails.includes(trimmed)) {
      setError('이미 추가된 이메일입니다.');
      return;
    }
    setEmails((prev) => [...prev, trimmed]);
    setEmail('');
    setError('');
  };

  const handleRemoveEmail = (target: string) => {
    setEmails((prev) => prev.filter((e) => e !== target));
  };

  const handleInvite = async () => {
    console.log('🚨 초대 버튼 클릭됨');
    if (emails.length === 0) {
      setError('초대할 이메일을 한 명 이상 추가해주세요.');
      return;
    }

    setLoading(true);
    try {
      console.log('📨 초대 시도 중:', emails);
      await inviteToGroupChat(chatRoomId, emails);
      if (onInvited) onInvited();
      onClose();
    } catch (err: any) {
      console.error('❌ 초대 실패:', err.response?.data || err);
      setError(err.response?.data?.message || '초대 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl w-[360px] relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">참여자 초대</h2>

        <div className="flex items-center mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddEmail();
            }}
            placeholder="이메일 입력"
            className="flex-1 px-3 py-2 border rounded-l-md text-sm"
          />
          <button
            onClick={handleAddEmail}
            className="px-3 py-2 bg-gray-200 text-sm rounded-r-md hover:bg-gray-300"
          >
            확인
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">목록</label>
          <div className="space-y-2">
            {emails.map((e, index) => (
              <div
                key={index}
                className="flex justify-between items-center px-3 py-2 border rounded-md"
              >
                <span className="text-sm">{e}</span>
                <button
                  onClick={() => handleRemoveEmail(e)}
                  className="text-red-500 text-lg hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

        <button
          onClick={() => {
            console.log('🖱 초대 버튼 눌림');
            handleInvite();
          }}
          disabled={loading}
          className="w-full py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '초대 중...' : '초대'}
        </button>
      </div>
    </div>
  );
}
