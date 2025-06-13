import React, { useState } from 'react';

interface MessageInputProps {
  onSend: (text: string, file?: File) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isComposing, setIsComposing] = useState(false); // 👈 조합 중인지 확인

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center border-t p-2"
    >
      <input
        type="text"
        className="flex-1 border rounded-full px-4 py-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onCompositionStart={() => setIsComposing(true)}   
        onCompositionEnd={() => setIsComposing(false)}    

        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            if (isComposing) return;
            e.preventDefault();
            handleSubmit(e as any);
          }
        }}
        placeholder="메시지 보내기"
      />
      <button type="submit" className="ml-2 px-4 py-2 rounded bg-blue-500 text-white">
        전송
      </button>
    </form>
  );
}
