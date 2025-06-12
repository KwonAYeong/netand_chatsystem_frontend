import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import NotificationRadio from '../settings/NotificationRadio';
import { useUser } from '../../context/UserContext';
import { getDMNotificationSettings, putDMNotificationLevel } from '../../api/settings'; 
import { AlertType } from '../../types/notification';

interface Props {
  chatRoomId: number; // DM용 chat_room_id
  onClose: () => void;
}

const DMNotificationModal = ({ chatRoomId, onClose }: Props) => {
  const { user } = useUser();
  const [notificationLevel, setNotificationLevel] = useState<AlertType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;

    getDMNotificationSettings(user.userId, chatRoomId)
      .then((data) => {
        setNotificationLevel(data.alertType);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('❌ DM 알림 설정 로딩 실패:', err);
      });
  }, [user, chatRoomId]);

  useEffect(() => {
    if (!user?.userId || notificationLevel === null || !isLoaded) return;

    putDMNotificationLevel(user.userId, chatRoomId, notificationLevel)
      .catch((err) => {
        console.error('❌ DM 알림 레벨 저장 실패:', err);
      });
  }, [notificationLevel, user, chatRoomId, isLoaded]);

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
          <NotificationRadio
            value={notificationLevel as AlertType}
            onChange={setNotificationLevel}
          />
        ) : (
          <div className="text-sm text-gray-500">로딩 중...</div>
        )}
      </div>
    </div>
  );
};

export default DMNotificationModal;
