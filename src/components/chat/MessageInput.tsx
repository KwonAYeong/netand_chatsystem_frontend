import React, { useRef, useState } from 'react';

export default function MessageInput({ onSend }: { onSend: (msg: string, file?: File) => void }) {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim() === '' && !selectedFile) return;

    onSend(input, selectedFile ?? undefined);
    setInput('');
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex items-center px-4 py-2 bg-white border-t gap-2">
      {/* + 버튼 (파일 선택) */}
      <button
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

      {/* 선택한 파일 이름 보여주기 */}
      {selectedFile && (
        <span className="text-sm text-gray-600 truncate max-w-[150px]">{selectedFile.name}</span>
      )}

      {/* 메시지 입력창 */}
      <input
        type="text"
        placeholder="메시지 보내기"
        className="flex-1 px-4 py-2 border rounded-full bg-gray-100"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />

      {/* 전송 버튼 */}
      <button onClick={handleSend} className="px-4 py-1 bg-black text-white rounded-full">
        전송
      </button>
    </div>
  );
}
