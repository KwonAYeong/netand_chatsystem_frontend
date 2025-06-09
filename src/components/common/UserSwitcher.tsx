// components/sidebar/UserSwitcher.tsx
import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { MdPerson } from 'react-icons/md';

const dummyUserIds = [1, 2, 3, 4];

const UserSwitcher = () => {
  const { user, setUserById } = useUser();
  const [showList, setShowList] = useState(false);

  return (
    <div className="relative w-6 h-6">
      {/* 완전 투명한 버튼 */}
      <button
        className="absolute inset-0 opacity-0 hover:opacity-20 transition duration-200 rounded-full"
        onClick={() => setShowList(!showList)}
        aria-label="유저 전환 버튼"
      />

      {/* 리스트 박스: 클릭 시만 보임 */}
      {showList && (
        <div className="absolute bottom-full mb-2 left-0 w-36 bg-white rounded shadow-lg border border-gray-200 z-50">
          {dummyUserIds.map((id) => (
            <button
              key={id}
              onClick={() => {
                setUserById(id);
                setShowList(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                user?.userId === id ? 'bg-blue-100' : ''
              }`}
            >
              <MdPerson className="inline-block mr-1" />
              User {id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
