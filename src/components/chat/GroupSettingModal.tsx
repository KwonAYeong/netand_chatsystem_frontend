// src/components/panel/GroupSettingModal.tsx
import { useEffect, useState } from 'react';
import NotificationRadio from '../settings/NotificationRadio';
import { AlertType } from '../../types/notification';
import {
  patchGroupChatRoomName,
  leaveGroupChat,
  getGroupMembers,
} from '../../api/chat';
import {
  putGroupNotificationLevel,
  getChatRoomNotificationSettings,
} from '../../api/settings';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../context/ChatUIContext';
import InviteMoreModal from '../panel/InviteMoreModal'; // ✅ 추가
import { api } from '../../api/axios';

interface Props {
  roomId: number;
  onClose: () => void;
  onLeft?: (roomId: number) => void;
}

const GroupSettingModal = ({ roomId, onClose, onLeft }: Props) => {
  const { user } = useUser();
  const { user: currentUser } = useUser();
  const {
    chatRooms,
    setChatRooms,
    selectedRoom,
    setSelectedRoom,
    setCurrentChatRoomId,
  } = useChatUI();

  const [name, setName] = useState('');
  const [notificationLevel, setNotificationLevel] = useState<AlertType>('ALL');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false); // ✅ 초대 모달 상태

  const handleSave = async () => {
    try {
      const trimmed = name.trim();
      if (!trimmed) {
        alert('채팅방 이름을 입력해주세요.');
        return;
      }

      if (trimmed !== selectedRoom?.name) {
        await patchGroupChatRoomName(roomId, trimmed);
        setChatRooms((prev) =>
          prev.map((room) =>
            room.id === roomId ? { ...room, name: trimmed } : room
          )
        );
        if (selectedRoom?.id === roomId) {
          setSelectedRoom({ ...selectedRoom, name: trimmed });
        }
      }

      await putGroupNotificationLevel(user!.userId, roomId, notificationLevel);
      onClose();
    } catch (err) {
      console.error('설정 저장 실패:', err);
    }
  };

 const handleLeaveGroup = async () => {
  if (!window.confirm('정말 이 채팅방을 나가시겠습니까?')) return;
  if (!currentUser) return;

  try {
    await api.delete(`/chat/${roomId}/leave/${currentUser.userId}`);
    onLeft?.(roomId);
  } catch (e) {
    console.error('나가기 실패:', e);
    alert('나가기 실패');
  }
};

  useEffect(() => {
    if (selectedRoom?.name) {
      setName(selectedRoom.name);
    }
  }, [selectedRoom?.name]);

  useEffect(() => {
    const fetchAlertSetting = async () => {
      try {
        const res = await getChatRoomNotificationSettings(user!.userId, roomId);
        if (!res || typeof res.alertType !== 'string') return;
        setNotificationLevel(res.alertType as AlertType);
      } catch (err) {
        console.error('알림 설정 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlertSetting();
  }, [roomId, user?.userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-96 space-y-6">
        <h2 className="text-lg font-bold">그룹 채팅방 설정</h2>

        {/* 채팅방 이름 */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">채팅방 이름</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 알림 설정 */}
        {!loading && (
          <NotificationRadio
            value={notificationLevel}
            onChange={setNotificationLevel}
            labelTitle="알림 설정"
            options={[
              { label: '모든 메시지', value: 'ALL' },
              { label: '멘션만', value: 'MENTION_ONLY' },
              { label: '끄기', value: 'NONE' },
            ]}
          />
        )}

        

        {/* 채팅방 나가기 */}
        <button
          onClick={handleLeaveGroup}
          className="text-sm text-red-500 underline mt-2"
        >
          그룹 채팅방 나가기
        </button>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-gray-500 px-3 py-1">
            취소
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            저장
          </button>
        </div>
      </div>

      {/* ✅ 초대 모달 */}
      {showInviteModal && (
        <InviteMoreModal
          chatRoomId={roomId}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            alert('초대가 완료되었습니다.');
          }}
        />
      )}
    </div>
  );
};

export default GroupSettingModal;
