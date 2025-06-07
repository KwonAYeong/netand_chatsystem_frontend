import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import type { Message } from '../../types/message';
import { Smile, Bookmark } from 'lucide-react';

interface Props {
  message: Message;
  showAvatar: boolean;
}

export default function MessageItem({ message, showAvatar }: Props) {
  const { user } = useUser();
  const [hovered, setHovered] = useState(false);
  const isMine = user?.userId === message.sender.id;

  return (
    <div
      className="relative group flex w-full px-4 py-1 gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 프로필 이미지 */}
      {showAvatar ? (
        <img
          src={
            isMine
              ? user?.profileImageUrl || '/default-profile.png'
              : message.sender.profileImageUrl || '/default-profile.png'
          }
          alt="profile"
          className="w-8 h-8 rounded-full mt-1"
        />
      ) : (
        <div className="w-8" />
      )}

      {/* 본문 영역 */}
      <div className="flex flex-col flex-1">
        {/* 이름 + 시간 */}
        {showAvatar && (
          <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <span>{isMine ? user?.name : message.sender.name}</span>
            <span className="text-xs text-gray-400 font-normal">{message.time}</span>
          </div>
        )}

        {/* 메시지 + 파일 */}
        <div className="text-sm whitespace-pre-wrap break-words px-3 py-1 rounded-md group-hover:bg-gray-100">
          {message.content}

          {message.fileUrl && (
            <div className="mt-1">
              {message.fileUrl.match(/\.(jpeg|jpg|png|gif|png|webp)$/i) ? (
                <img
                  src={message.fileUrl}
                  alt="preview"
                  className="max-w-xs mt-2 rounded"
                />
              ) : (
                <a
                  href={message.fileUrl}
                  download
                  className="text-blue-500 text-sm underline"
                >
                  첨부파일 다운로드
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 반응 버튼 */}
      {hovered && (
        <div className="absolute right-2 top-1 flex gap-2">
          <button className="text-gray-400 hover:text-black">
            <Smile size={16} />
          </button>
          <button className="text-gray-400 hover:text-black">
            <Bookmark size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
