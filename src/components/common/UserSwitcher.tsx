import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { MdPerson } from "react-icons/md";
import { disconnectSocket } from '../../lib/websocket';
import { useUserStatusContext } from '../../context/UserStatusContext';

const PersonIcon = MdPerson as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const dummyUserIds = [1, 2, 3, 4, 5, 6, 7, 8];

const UserSwitcher = () => {
  const { user, setUserById } = useUser();
  const [showList, setShowList] = useState(false);
const { subscribeUsers } = useUserStatusContext();
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
                setShowList(false);
                //disconnectSocket(); // 기존 연결 끊기
                await new Promise(res => setTimeout(res, 300));
                setUserById(id);     // 새 유저로 재연결 및 상태 갱신
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
