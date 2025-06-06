import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useChatUI } from '../../hooks/useChatUI';
import NotificationRadio from './NotificationRadio';
import TimezoneSelector from './TimezoneSelector';
import { getNotificationSettings, patchGlobalNotificationSettings } from '../../api/settings';
import { AlertType } from '../../types/notification';
import { useUser } from '../../context/UserContext';
import SettingsMenu from './SettingsMenu';

const SettingsModal = () => {
  const { setShowSettingsModal } = useChatUI();
  const { user } = useUser();
  const [selectedMenu, setSelectedMenu] = useState('notification');
  const [notificationLevel, setNotificationLevel] = useState<AlertType | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
   
    if (!user?.userId) return;

    getNotificationSettings(user.userId)
      .then((data) => {
         console.log('불러온 설정:', data); 
        setNotificationLevel(data.alertType);
        setStartTime(data.startTime);
        setEndTime(data.endTime);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('❌ 알림 설정 로딩 실패:', err);
      });
  }, [user]);

  // 자동 저장: 값이 바뀔 때마다 호출
  useEffect(() => {
    if (!user?.userId || notificationLevel === null || !isLoaded) return;

    patchGlobalNotificationSettings(user.userId, {
      alertType: notificationLevel,
      notificationStartTime: startTime,
      notificationEndTime: endTime,
    }).catch((err) => {
      console.error('❌ 설정 자동 저장 실패:', err);
    });
  }, [notificationLevel, startTime, endTime, user?.userId, isLoaded]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm"
      onClick={() => setShowSettingsModal(false)}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-xl min-w-[500px] min-h-[380px] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowSettingsModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4">환경 설정</h2>
        <div className="flex">
          {/* 좌측 메뉴 */}
          <SettingsMenu selected={selectedMenu} onSelect={setSelectedMenu} />

          {/* 우측 내용 */}
          <div className="flex-1 pl-6">
            {selectedMenu === 'notification' && isLoaded && (
              <div className="space-y-6">
                <NotificationRadio value={notificationLevel as AlertType} onChange={setNotificationLevel} />
                <TimezoneSelector
                  start={startTime}
                  end={endTime}
                  onChangeStart={setStartTime}
                  onChangeEnd={setEndTime}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
