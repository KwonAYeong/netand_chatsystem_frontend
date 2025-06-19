import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import type { Message } from '../../types/message';
import { Smile, Bookmark, Download } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import { useChatUI } from '../../hooks/useChatUI';

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

function isImageFile(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
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
  const { setSelectedUser, setShowProfile } = useChatUI();
  const fileLink = message.fileUrl || message.content;
  const fileName = decodeURIComponent(fileLink?.split('/').pop() || '파일');
 const handleAvatarClick = () => {
  setSelectedUser({
    userId: message.sender.id, // 👈 이 구조로 맞춰줘야 함
  });
  setShowProfile(true);
};
  return (
    <div
      className="relative flex items-start px-4 py-1 gap-2 hover:bg-gray-100 rounded-md transition group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 프로필 이미지 */}
      {showAvatar ? (
        <UserAvatar
          src={
            isMine
              ? user?.profileImageUrl || '/default_profile.jpg'
              : message.sender.profileImageUrl || '/default_profile.jpg'
          }
          alt={`${message.sender.name} 프로필`}
          size="sm"
          onClick={handleAvatarClick}
        />
      ) : (
        <div className="w-6" />
      )}

      <div className="flex flex-col">
        {/* 이름 + 시간 */}
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
          
            <div className="flex items-center gap-2">
              <span>📎</span>
              <span className="text-sm text-black break-all">{fileName}</span>
            <a
              href={fileLink}
              download={fileName}
              className="flex items-center gap-1 text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 transition"
            >
              <Download size={15} /> 
            </a>
          </div>
        )}
      </div>

      {/* 반응 버튼 */}
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
