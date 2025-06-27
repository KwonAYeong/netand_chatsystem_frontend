// src/components/chat/MessageInput.tsx
import React, { useRef, useState, useEffect } from 'react';
import type { User } from '../../types/user';
import { getGroupMembers } from '../../api/chat';
interface MessageInputProps {
  onSend: (text: string, file?: File, mentionedUserNames?: string[]) => void;
  chatRoomId: number;
  hasMention?: boolean;
}

export default function MessageInput({ onSend, chatRoomId, hasMention = true }: MessageInputProps) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const [participants, setParticipants] = useState<User[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionCandidates, setMentionCandidates] = useState<User[]>([]);
  const [mentionedUserNames, setMentionedUserNames] = useState<string[]>([]);
  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ 채팅방 입장 시 참가자 불러오기
  useEffect(() => {
    if (!hasMention) return;

    const fetchParticipants = async () => {
      try {
        const res = await getGroupMembers(chatRoomId);
        setParticipants(res.data); 
      } catch (err) {
        console.error('❌ 참가자 불러오기 실패', err);
      }
    };
    fetchParticipants();
  }, [chatRoomId, hasMention]);

  // ✅ 메시지 전송
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;

  const validMentionedNames = mentionedUserNames.filter((name) =>
    trimmed.includes(`@${name}`)
  );

    // ✅ onSend에는 진짜 언급된 사람만 넘김
    onSend(trimmed, selectedFile ?? undefined, validMentionedNames);
    setText('');
    setSelectedFile(null);
    setMentionedUserNames([]);
    setShowMentionList(false);
    setMentionCandidates([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleMentionSelect = (name: string) => {
  const cursor = inputRef.current?.selectionStart ?? text.length;
  const textUpToCursor = text.slice(0, cursor);
  const textAfterCursor = text.slice(cursor);

  // 마지막 @부터 커서까지 멘션 키워드 추출
  const newTextUpToCursor = textUpToCursor.replace(/@(\S*)$/, `@${name} `);

  const newFullText = newTextUpToCursor + textAfterCursor;

  setText(newFullText);

  // 멘션 이름 배열에 추가
  setMentionedUserNames((prev) =>
    prev.includes(name) ? prev : [...prev, name]
  );

  setShowMentionList(false);
  setMentionCandidates([]);
  setCursorIndex(0);

  // 커서 위치 재지정 (optional)
  setTimeout(() => {
    const newCursorPos = newTextUpToCursor.length;
    inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    if (!hasMention) return;

    const cursor = e.target.selectionStart ?? val.length;
    const textUpToCursor = val.slice(0, cursor);
    const match = textUpToCursor.match(/@([a-zA-Z가-힣]*)$/);

    if (match) {
      const keyword = match[1].toLowerCase();
      const filtered = participants.filter((user) =>
        user.name.toLowerCase().startsWith(keyword)
      );
      setMentionCandidates(filtered);
      setShowMentionList(true);
      setCursorIndex(0);
    } else {
      setShowMentionList(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center px-4 py-2 bg-white border-t gap-2">
      {/* 🔽 자동완성 팝업 */}
      {showMentionList && mentionCandidates.length > 0 && (
        <ul className="absolute bottom-14 left-10 bg-white border shadow-md rounded-md w-48 z-50">
          {mentionCandidates.map((user, idx) => (
            <li
              key={user.userId}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                cursorIndex === idx ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleMentionSelect(user.name)}
            >
              @{user.name}
            </li>
          ))}
        </ul>
      )}

      {/* 파일 선택 버튼 */}
      <button
        type="button"
        className="text-xl font-bold text-gray-500 hover:text-black"
        onClick={() => fileInputRef.current?.click()}
      >
        +
      </button>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {/* 선택한 파일 이름 */}
      {selectedFile && (
        <span className="text-sm text-gray-600 truncate max-w-[150px]">{selectedFile.name}</span>
      )}

      {/* 입력창 */}
      <input
        ref={inputRef}
        type="text"
        className="flex-1 border rounded-full px-4 py-2 bg-gray-100"
        value={text}
        onChange={handleChange}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
       onKeyDown={(e) => {
          // ✅ 자동완성 선택 먼저 처리
          if (showMentionList && mentionCandidates.length > 0) {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setCursorIndex((prev) => (prev + 1) % mentionCandidates.length);
              return;
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setCursorIndex((prev) =>
                prev === 0 ? mentionCandidates.length - 1 : prev - 1
              );
              return;
            } else if (e.key === 'Enter') {
              const selected = mentionCandidates[cursorIndex];
              if (selected) {
                e.preventDefault(); // ✅ 전송 막고
                handleMentionSelect(selected.name); // ✅ 멘션 선택
                return; // ⛔ 전송까지 넘어가지 않게 return 필수!
              }
            } else if (e.key === 'Escape') {
              setShowMentionList(false);
              return;
            }
          }

          // ✅ 메시지 전송은 그 외 상황일 때만 실행
          if (e.key === 'Enter' && !e.shiftKey) {
            if (isComposing) return;
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="메시지 보내기"
      />

      {/* 전송 버튼 */}
      <button type="submit" className="ml-2 px-4 py-2 bg-black text-white rounded-full">
        전송
      </button>
    </form>
  );
}
