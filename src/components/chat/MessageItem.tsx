import React, { useState } from 'react';
import { Message } from '../../types/message';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../context/ChatUIContext';
import { Download } from 'lucide-react';

interface Props {
  message: Message;
  isGrouped: boolean;
}

const isImageFile = (fileName: string) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
};

export default function MessageItem({ message, isGrouped }: Props) {
  const { user } = useUser();
  const isMine = user?.userId === message.sender.id;
  const [hovered, setHovered] = useState(false);
  const { setSelectedUser, setShowProfile } = useChatUI();

  const fileLink = message.fileUrl || message.content;
  const fileName = decodeURIComponent(fileLink?.split('/').pop() || '파일');

  const handleAvatarClick = () => {
    setSelectedUser?.({ userId: message.sender.id });
    setShowProfile?.(true);
  };

  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="relative flex items-start px-4 py-1 gap-2 hover:bg-gray-100 rounded-md transition group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isGrouped && (
        <img
          src={message.sender.profileImageUrl || '/profileEX.png'}
          alt="avatar"
          onClick={handleAvatarClick}
          className="w-9 h-9 rounded-md object-cover mt-1 cursor-pointer hover:opacity-80"
        />
      )}

      <div className="flex flex-col">
        {!isGrouped && (
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {message.sender.name}
            </span>
            <span className="text-xs text-gray-400">{timeString}</span>
          </div>
        )}

        <div
          className={`text-sm whitespace-pre-line leading-relaxed ${
            isMine ? 'text-blue-800' : 'text-gray-900'
          } ${isGrouped ? 'pl-[54px]' : 'mt-1'}`}
        >
          {/* 텍스트 메시지 */}
          {message.messageType === 'TEXT' && message.content}

          {/* 파일 메시지 */}
          {message.messageType === 'FILE' && fileLink && (
            isImageFile(fileLink) ? (
              // ✅ 이미지 파일
              <div className="max-w-[300px] max-h-[300px] mt-1 flex flex-col">
                <img
                  src={fileLink}
                  alt={fileName}
                  className="rounded-lg object-contain max-w-full max-h-[300px]"
                />
                <a
                  href={fileLink}
                  download={fileName}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 transition w-fit"
                >
                  <Download size={15} />
                  다운로드
                </a>
              </div>
            ) : (
              // ✅ 일반 파일
              <div className="flex flex-col mt-1">
                <span className="text-sm break-all mb-1">{fileName}</span>
                <a
                  href={fileLink}
                  download={fileName}
                  className="flex items-center gap-1 text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 transition w-fit"
                >
                  <Download size={15} />
                  다운로드
                </a>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
