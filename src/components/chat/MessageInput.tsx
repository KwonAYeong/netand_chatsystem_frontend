// src/components/chat/MessageInput.tsx
import React, { useRef, useState } from 'react';

interface MessageInputProps {
  onSend: (text: string, file?: File) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;

    onSend(trimmed, selectedFile ?? undefined);
    setText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center px-4 py-2 bg-white border-t gap-2">
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

      {/* 메시지 입력창 */}
      <input
        type="text"
        className="flex-1 border rounded-full px-4 py-2 bg-gray-100"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onKeyDown={(e) => {
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
