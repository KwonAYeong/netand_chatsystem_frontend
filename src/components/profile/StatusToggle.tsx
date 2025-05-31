interface StatusToggleProps {
  value: 'online' | 'away';
  onChange: (value: 'online' | 'away') => void;
}

const StatusToggle = ({ value, onChange }: StatusToggleProps) => {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700">상태</p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange('online')}
          className={`px-3 py-1 rounded text-sm ${
            value === 'online' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          온라인
        </button>
        <button
          onClick={() => onChange('away')}
          className={`px-3 py-1 rounded text-sm ${
            value === 'away' ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          자리비움
        </button>
      </div>
    </div>
  );
};

export default StatusToggle;
