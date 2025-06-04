// components/sidebar/UserSwitcher.tsx
import { useState } from 'react';
import { mockUsers } from '../../mock/users';
import { useUser } from '../../context/UserContext';
import { MdPerson } from 'react-icons/md';

const UserSwitcher = () => {
  const { setUserById} = useUser();
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
        <div className="absolute top-8 left-0 w-36 bg-white rounded shadow-lg border border-gray-200 z-50">
          {mockUsers.map((u) => (
            <button
              key={u.user_id}
              onClick={() => {
                setUserById(u.user_id);
                setShowList(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
            >
              <MdPerson className="inline-block mr-1" />
                {u.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
