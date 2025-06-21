import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import NotificationRadio from '../settings/NotificationRadio';
import { useUser } from '../../context/UserContext';
import { getChatRoomNotificationSettings, putDMNotificationLevel } from '../../api/settings';
import { AlertType } from '../../types/notification';
import { useNotificationSettings } from '../../context/NotificationSettingsContext';
interface Props {
  chatRoomId: number;
  onClose: () => void;
}

const DMNotificationModal = ({ chatRoomId, onClose }: Props) => {
  const { user } = useUser();
  const { refreshSettings } = useNotificationSettings();
  const [notificationLevel, setNotificationLevel] = useState<AlertType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (!user?.userId) return;

    getChatRoomNotificationSettings(user.userId, chatRoomId)
      .then((data) => {
        setNotificationLevel(data.alertType);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('❌ DM 알림 설정 로딩 실패:', err);
      });
  }, [user, chatRoomId]);

  // 저장 버튼 핸들러
  const handleSave = async () => {
    if (!user?.userId || notificationLevel === null) return;

    try {
      await putDMNotificationLevel(user.userId, chatRoomId, notificationLevel);
      console.log('✅ DM 알림 설정 저장 완료');
      await refreshSettings();
      onClose(); // 저장 후 모달 닫기
    } catch (err) {
      console.error('❌ DM 알림 레벨 저장 실패:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md min-w-[400px] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-4">알림 설정</h2>

        {isLoaded ? (
          <div className="space-y-6">
            <NotificationRadio
              value={notificationLevel as AlertType}
              onChange={setNotificationLevel}
            />
            {/* 저장 버튼 */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">로딩 중...</div>
        )}
      </div>
    </div>
  );
};

export default DMNotificationModal;
