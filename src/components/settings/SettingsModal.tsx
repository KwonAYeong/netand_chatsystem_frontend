import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useChatUI } from '../../hooks/useChatUI';
import NotificationRadio from './NotificationRadio';
import TimezoneSelector from './TimezoneSelector';
import {
  getNotificationSettings,
  putGlobalNotificationLevel,
  putNotificationTimeSettings,
} from '../../api/settings';
import { AlertType } from '../../types/notification';
import { useUser } from '../../context/UserContext';
import SettingsMenu from './SettingsMenu';

const SettingsModal = () => {
  const { setShowSettingsModal } = useChatUI();
  const { user } = useUser();
  const [selectedMenu, setSelectedMenu] = useState('notification');
  const [notificationLevel, setNotificationLevel] = useState<AlertType | null>(null);
  const [notificationStartTime, setStartTime] = useState('');
  const [notificationEndTime, setEndTime] = useState('');

  // GET → 한 번에 받기
  useEffect(() => {
    if (!user?.userId) return;

    getNotificationSettings(user.userId)
      .then((data) => {
        console.log('불러온 설정:', data);
        setNotificationLevel(data.alertType);
        setStartTime(data.notificationStartTime);
        setEndTime(data.notificationEndTime);
      })
      .catch((err) => {
        console.error('❌ 알림 설정 로딩 실패:', err);
      });
  }, [user]);

  // 저장 버튼 핸들러
  const handleSave = async () => {
    if (!user?.userId || notificationLevel === null) return;

    try {
      await putGlobalNotificationLevel(user.userId, notificationLevel);
      await putNotificationTimeSettings(user.userId, notificationStartTime, notificationEndTime);
      console.log('✅ 알림 설정 저장 완료');
      setShowSettingsModal(false); // 저장 후 모달 닫기 (원하면 제거 가능)
    } catch (err) {
      console.error('❌ 알림 설정 저장 실패:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm"
      onClick={() => setShowSettingsModal(false)}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-xl min-w-[500px] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowSettingsModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4">환경 설정</h2>
        <div className="flex items-stretch"> {/* 높이 예시 고정 또는 min-h 사용 */}
          {/* 좌측 메뉴 */}
          <SettingsMenu selected={selectedMenu} onSelect={setSelectedMenu} />

          {/* 우측 내용 */}
          <div className="flex-1 flex flex-col pl-6 min-h-[300px]">  {/* 고정 width 적용 */}
            <div className="flex-1 space-y-6">
              <NotificationRadio value={notificationLevel as AlertType} onChange={setNotificationLevel} />
              <TimezoneSelector
                start={notificationStartTime}
                end={notificationEndTime}
                onChangeStart={setStartTime}
                onChangeEnd={setEndTime}
              />
            </div>

            {/* 저장 버튼 */}
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
            >
              저장
            </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
