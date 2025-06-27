import { useEffect, useState, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { useChatUI } from '../../hooks/useChatUI';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import UserProfileCard from './UserProfileCard';
import { getUserProfileById } from '../../api/profile';
import { User } from '../../types/user';
import { setAway, setOnline } from '../../lib/websocket';

const ProfilePanel = () => {
  const { setShowProfile, setShowProfileModal, selectedUser, setSelectedUser } = useChatUI();
  const { user: currentUser, setUser, wsConnected } = useUser(); 
  const [remoteProfile, setRemoteProfile] = useState<User | null>(null);
  const isMe = selectedUser?.userId === currentUser?.userId;
  const profile: User | null = isMe ? currentUser : remoteProfile;

  // ✅ selectedUser와 상태가 준비되었을 때만 렌더링

  // ✅ currentUser 바뀌면 selectedUser도 동기화
  useEffect(() => {
    if (currentUser && selectedUser?.userId === currentUser.userId) {
      setSelectedUser(currentUser);
    }
  }, [currentUser]);

  // ✅ 상대 프로필 로딩
  useEffect(() => {
    if (!selectedUser || isMe) return;
    (async () => {
      try {
        const data = await getUserProfileById(selectedUser.userId);
        setRemoteProfile({ ...data, userId: data.id });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedUser, isMe]);

  const stableUserIds = useMemo(() => {
    if (
      selectedUser &&
      typeof selectedUser.userId === 'number' &&
      selectedUser.userId !== currentUser?.userId // 본인은 제외
    ) {
      return [selectedUser.userId];
    }
    return [];
  }, [selectedUser, currentUser]);

  const handleStatusChange = async (isActive: boolean) => {
    if (!profile) return;
    const newStatus = isActive ? 'ONLINE' : 'AWAY';

    try {
      if (isActive) setOnline(profile.userId);
      else setAway(profile.userId);

      if (isMe) {
        setUser((prev) =>
          prev ? { ...prev, isActive, status: newStatus } : prev
        );
      } else {
        setRemoteProfile((prev) =>
          prev ? { ...prev, isActive, status: newStatus } : prev
        );
      }
    } catch (err) {
      console.error('상태 변경 실패', err);
    }
  };

  // ✅ 준비되지 않으면 로딩 화면
  if (!selectedUser || !profile) {
    return (
      <aside>
        <ProfileHeader onClose={() => setShowProfile(false)} />
        <div>로딩 중...</div>
      </aside>
    );
  }

  return (
    <aside className="w-[400px] h-full bg-white border-l border-gray-200 right-0 top-0 shadow-lg flex flex-col z-50">
      <ProfileHeader onClose={() => setShowProfile(false)} />
      <div className="flex-1 overflow-y-auto">
        {isMe ? (
          <ProfileCard user={profile!} onIsActiveChange={handleStatusChange} />
        ) : (
          <UserProfileCard user={profile} />
        )}
      </div>
      {isMe && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            편집
          </button>
        </div>
      )}
    </aside>
  );
};

export default ProfilePanel;
