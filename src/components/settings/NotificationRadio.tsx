import { AlertType } from '../../types/notification';

interface Props {
  value: AlertType;
  onChange: (value: AlertType) => void;
  options?: { label: string; value: AlertType }[];
  labelTitle?: string;
}

const defaultOptions: { label: string; value: AlertType }[] = [
  { label: '켜기', value: 'ALL' },
  { label: '끄기', value: 'NONE' },
];

const NotificationRadio = ({
  value,
  onChange,
  options = defaultOptions,
  labelTitle = '전체 알림',
}: Props) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-gray-700">{labelTitle}</p>
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
