// src/components/chat/MemberListModal.tsx
import React from 'react';
import type { User } from '../../types/user';

interface Props {
  members: User[];
  onClose: () => void;
}

export default function MemberListModal({ members, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">👥 채팅방 멤버</h2>

        {members.length === 0 ? (
          <p className="text-gray-500 text-sm">멤버가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.email} className="flex items-center space-x-2">
                <img
                  src={member.profileImageUrl || '/default-profile.png'}
                  alt={member.name}
                  className="w-8 h-8 rounded"
                />
                <span className="text-sm text-gray-800">{member.name}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white text-sm py-2 rounded"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
