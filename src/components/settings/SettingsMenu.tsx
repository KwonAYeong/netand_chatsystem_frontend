interface Props {
  selected: string;
  onSelect: (key: string) => void;
}

const categories = [
  { key: 'notification', label: '알림' },
  // 나중에: { key: 'profile', label: '프로필' },
  // 나중에: { key: 'theme', label: '테마' },
];

const SettingsMenu = ({ selected, onSelect }: Props) => {
  return (
    <div className="flex flex-col w-24 space-y-2">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`py-2 rounded text-sm font-medium ${
            selected === cat.key
              ? 'bg-gray-800 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default SettingsMenu;
