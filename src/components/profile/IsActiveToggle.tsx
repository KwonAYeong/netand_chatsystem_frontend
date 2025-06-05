interface IsActiveToggleProps {
  isActive: boolean;
  onChange: (value: boolean) => void;
  compact?: boolean; 
}

const IsActiveToggle = ({ isActive, onChange, compact = false }: IsActiveToggleProps) => {
  if (compact) {
    return (
      <>
        {isActive ? (
          <button
            onClick={() => onChange(false)}
            className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-400 text-sm"
          >
            <span className="text-white font-semibold">자리비움</span>
            <span className="text-black">으로 설정</span>
          </button>
        ) : (
          <button
            onClick={() => onChange(true)}
            className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-400 text-sm"
          >
            <span className="text-white font-semibold">온라인</span>
            <span className="text-black">으로 설정</span>
          </button>
        )}
      </>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700">상태</p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`px-3 py-1 rounded text-sm ${
            isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          온라인
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-3 py-1 rounded text-sm ${
            !isActive ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          자리비움
        </button>
      </div>
    </div>
  );
};

export default IsActiveToggle;
