interface IsActiveToggleProps {
  isActive: boolean;
  onChange: (value: boolean) => void;
}

const IsActiveToggle = ({ isActive, onChange }: IsActiveToggleProps) => {
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
