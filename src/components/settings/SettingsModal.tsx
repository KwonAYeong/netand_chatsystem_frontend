// components/settings/SettingsModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import { useChatUI } from '../../hooks/useChatUI';

const SettingsModal = () => {
  const { setShowSettingsModal } = useChatUI();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onClick={() => setShowSettingsModal(false)} // 배경 클릭 시 닫기
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭은 이벤트 막기
      >
        {/* 닫기 버튼 */}
        <button
          onClick={() => setShowSettingsModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4">환경 설정</h2>

        {/* 여기에 설정 내용 추가 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">전체 알림</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div className="absolute w-4 h-4 bg-white rounded-full left-1 top-1 peer-checked:translate-x-5 transition-transform"></div>
            </label>
          </div>

          <div>
            <label className="text-sm text-gray-700">알림 수신 시간</label>
            <select className="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-sm">
              <option>항상</option>
              <option>08:30 ~ 20:30</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
