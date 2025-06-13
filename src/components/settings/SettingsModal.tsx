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
import { useNotificationSettings } from '../../context/NotificationSettingsContext';

const SettingsModal = () => {
  const { setShowSettingsModal } = useChatUI();
  const { user } = useUser();
  const { refreshSettings } = useNotificationSettings();
  const [notificationLevel, setNotificationLevel] = useState<AlertType | null>(null);
  const [notificationStartTime, setStartTime] = useState<string | undefined>(undefined);
  const [notificationEndTime, setEndTime] = useState<string | undefined>(undefined);
  const [selectedMenu, setSelectedMenu] = useState('notification'); // 빠져있던 selectedMenu 추가
  const [loading, setLoading] = useState(true);
  // Context 값 → local state에 sync
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.userId) return;

      try {
        const settings = await getNotificationSettings(user.userId);
        console.log('SettingsModal 초기 세팅:', settings);

        setNotificationLevel(settings.alertType);
        setStartTime(settings.notificationStartTime || undefined);
        setEndTime(settings.notificationEndTime || undefined);
      } catch (err) {
        console.error('❌ 알림 설정 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user?.userId]);


  const handleSave = async () => {
    if (!user?.userId || notificationLevel === null) return;

    try {
      await putGlobalNotificationLevel(user.userId, notificationLevel); // 그대로 AlertType 전송
      await putNotificationTimeSettings(
        user.userId,
        notificationStartTime && notificationStartTime.trim() !== '' ? notificationStartTime : undefined,
        notificationEndTime && notificationEndTime.trim() !== '' ? notificationEndTime : undefined
      );

      console.log('✅ 알림 설정 저장 완료');

      // 저장 후 Context 최신화 → 다른 화면에서도 최신으로 반영됨
      await refreshSettings();

      setShowSettingsModal(false);
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
        <div className="flex items-stretch">
          <SettingsMenu selected={selectedMenu} onSelect={setSelectedMenu} />
          <div className="flex-1 flex flex-col pl-6 min-h-[300px]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500"></div>
            ) : (
              <>
                <div className="flex-1 space-y-6">
                  <NotificationRadio value={notificationLevel as AlertType} onChange={setNotificationLevel} />
                  <TimezoneSelector
                    start={notificationStartTime ?? ''}
                    end={notificationEndTime ?? ''}
                    onChangeStart={setStartTime}
                    onChangeEnd={setEndTime}
                  />
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    저장
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
