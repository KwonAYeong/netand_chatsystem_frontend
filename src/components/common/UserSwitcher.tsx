import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { MdPerson } from "react-icons/md";
import { disconnectSocket } from '../../lib/websocket';
import { useUserStatusContext } from '../../context/UserStatusContext';

const PersonIcon = MdPerson as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const dummyUserIds = [1, 2, 3, 4, 5, 6, 7, 8];

const UserSwitcher = () => {
  const { user } = useUser();
  const [showList, setShowList] = useState(false);

  return (
    <div className="relative w-6 h-6">
      <button
        className="absolute inset-0 opacity-0 hover:opacity-20 transition duration-200 rounded-full"
        onClick={() => setShowList(!showList)}
        aria-label="유저 전환 버튼"
      />

      {showList && (
        <div className="absolute bottom-full mb-2 left-0 w-36 bg-white rounded shadow-lg border border-gray-200 z-50">
          {dummyUserIds.map((id) => (
            <button
              key={id}
              onClick={async () => {
                if (user?.userId === id) {
                  setShowList(false); // 자기 자신 선택하면 무시
                  return;
                }

                disconnectSocket(); // ✅ 현재 연결 종료
                localStorage.setItem('userId', String(id)); // ✅ 새 유저 저장
                setShowList(false);
                await new Promise((res) => setTimeout(res, 100)); // 소켓 종료 여유
                window.location.reload(); // ✅ 새로고침으로 유저 전환
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                user?.userId === id ? 'bg-blue-100' : ''
              }`}
            >
              <PersonIcon className="inline-block mr-1" />
              User {id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
