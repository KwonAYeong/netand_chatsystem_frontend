import { AlertType } from '../../types/notification';

interface Props {
  value: AlertType;
  onChange: (value: AlertType) => void;
}

const NotificationRadio = ({ value, onChange }: Props) => {
  const options: { label: string; value: AlertType }[] = [
    { label: '켜기', value: 'ALL' },
    { label: '끄기', value: 'NONE' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">전체 알림</p>
      <div className="flex gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-1 text-sm cursor-pointer"
          >
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default NotificationRadio;
