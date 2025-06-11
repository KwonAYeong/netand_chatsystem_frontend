// src/components/chat/MessageItem.tsx
import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import type { Message } from '../../types/message';
import { Smile, Bookmark } from 'lucide-react'; // 아이콘

interface Props {
  message: Message;
  showAvatar: boolean;
}

function isUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function MessageItem({ message, showAvatar }: Props) {
  const { user } = useUser();
  const isMine = user?.userId === message.sender.id;
  const [hovered, setHovered] = useState(false);

  const fileLink = message.fileUrl || message.content;
  const fileName = decodeURIComponent(fileLink?.split('/').pop() || '파일');

  return (
    <div
      className="relative flex items-start px-4 py-1 gap-2 hover:bg-gray-100 rounded-md transition group"
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

      <div className="flex flex-col">
        {/* 유저 이름 + 시간 */}
        {showAvatar && (
          <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
            <span>{message.sender.name}</span>
            <span className="text-gray-400">· {formatTime(message.createdAt)}</span>
          </div>
        )}

        {/* 텍스트 메시지 */}
        {message.messageType === 'TEXT' && message.content && (
          <div className="text-sm text-black max-w-[300px] break-words">
            {isUrl(message.content) ? (
              <a
                href={message.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                📎 {message.content}
              </a>
            ) : (
              message.content
            )}
          </div>
        )}

        {/* 파일 메시지 */}
        {message.messageType === 'FILE' && fileLink && (
          <a
            href={fileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline break-all max-w-[300px]"
          >
            📎 {fileName}
          </a>
        )}
      </div>

      {/* 반응 / 북마크 버튼 - hover 시에만 보임 */}
      {hovered && (
        <div className="absolute right-4 top-2 flex gap-2 text-gray-400">
          <button>
            <Smile size={16} />
          </button>
          <button>
            <Bookmark size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
