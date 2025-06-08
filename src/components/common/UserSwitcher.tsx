// components/sidebar/UserSwitcher.tsx
import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { MdPerson } from 'react-icons/md';
import { api } from '../../api/axios';

interface SimpleUser {
  userId: number;
  name: string;
}

const UserSwitcher = () => {
  const { setUser } = useUser();
  const [showList, setShowList] = useState(false);
  const [users, setUsers] = useState<SimpleUser[]>([]);

  useEffect(() => {
    api.get('/users/all') // 👉 실제 전체 유저 리스트를 가져오는 API
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('유저 목록 불러오기 실패', err));
  }, []);

  return (
    <div className="relative w-6 h-6">
      <button
        className="absolute inset-0 opacity-0 hover:opacity-20 transition duration-200 rounded-full"
        onClick={() => setShowList(!showList)}
        aria-label="유저 전환 버튼"
      />

      {showList && (
        <div className="absolute top-8 left-0 w-36 bg-white rounded shadow-lg border border-gray-200 z-50">
          {users.map((u) => (
            <button
              key={u.userId}
              onClick={() => {
                setUser(u); // ✅ 직접 유저 정보 설정
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
