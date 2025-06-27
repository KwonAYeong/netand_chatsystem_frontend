import React, { useState } from 'react';
import { Message } from '../../types/message';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../context/ChatUIContext';
import { Download } from 'lucide-react';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
  const isMentioned = message.mentionedUserNames?.includes(user?.name || '');

  const handleAvatarClick = () => {
    setSelectedUser?.({ userId: message.sender.id });
    setShowProfile?.(true);
  };

  const timeString = dayjs(message.createdAt).format('HH:mm');


  function highlightMentions(text: string, mentionedNames: string[] = []) {
    let result: React.ReactNode[] = [];
    let lastIndex = 0;

    const mentionRegex = new RegExp(`@(${mentionedNames.join('|')})`, 'g');

    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;

      if (start > lastIndex) {
        result.push(text.slice(lastIndex, start));
      }

      result.push(
        <span key={start} className="bg-blue-200 text-blue-500 px-1 rounded font-bold">
          {match[0]}
        </span>
      );

      lastIndex = end;
    }

    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  }

  return (
    <div
      className="relative flex items-start px-4 py-1 gap-2 rounded-md transition group hover:bg-gray-100"
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
            <span className="text-sm font-semibold text-black">
              {message.sender.name}
            </span>
            <span className="text-xs text-gray-400">{timeString}</span>
          </div>
        )}

        <div
          className={`text-sm whitespace-pre-line leading-relaxed text-black mt-1 ${
            isGrouped ? 'pl-[42px]' : ''
          }`}
        >
          {message.messageType === 'TEXT' &&
            highlightMentions(message.content, message.mentionedUserNames)}

          {message.messageType === 'FILE' && fileLink && (
            isImageFile(fileLink) ? (
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
