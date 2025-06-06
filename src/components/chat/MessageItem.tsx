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
  const isMine = user?.userId === message.sender.id;
  const [hovered, setHovered] = useState(false);

  // 파일 확장자 판별 함수
  const isImage = (url: string) => {
    return /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
  };

  return (
    <div
      className="relative group flex w-full px-4 py-1 gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 프로필 */}
      {showAvatar ? (
        <img
          src={message.sender.profileImageUrl || '/default-profile.png'}
          alt="profile"
          className="w-8 h-8 rounded-full mt-1"
        />
      ) : (
        <div className="w-8" />
      )}

      {/* 본문 영역 */}
      <div className="flex flex-col flex-1">
        {showAvatar && (
          <div className="text-sm font-semibold text-gray-700 mb-1">
            {message.sender.name}
          </div>
        )}

        <div className="text-sm whitespace-pre-wrap break-words px-3 py-1 rounded-md group-hover:bg-gray-100">
          {/* 메시지 텍스트 */}
          {message.content}

          {/* 파일 미리보기 or 다운로드 */}
          {message.fileUrl && (
            <div className="mt-2">
              {isImage(message.fileUrl) ? (
                <img
                  src={message.fileUrl}
                  alt="uploaded"
                  className="max-w-xs max-h-64 rounded border"
                />
              ) : (
                <a
                  href={message.fileUrl}
                  download
                  className="text-blue-500 underline text-sm"
                >
                  파일 다운로드
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 반응 버튼 */}
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
