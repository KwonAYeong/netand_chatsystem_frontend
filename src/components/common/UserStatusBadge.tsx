interface Props {
  finalStatus?: 'ONLINE' | 'AWAY';
  isSelf?: boolean;
  isActive?: boolean;
  wsConnected?: boolean;
  size?: number;
  withText?: boolean;
}

const UserisActiveBadge = ({
  finalStatus,
  isSelf = false,
  isActive = false,
  size = 8,
  withText = false,
}: Props) => {
  const shouldShowOnline = isSelf ? isActive: finalStatus === 'ONLINE';
  const color = shouldShowOnline ? 'bg-green-500' : 'bg-gray-400';
  const label = shouldShowOnline ? '온라인' : '자리 비움';

  return (
    <div className="flex items-center gap-1">
      <span
        className={`rounded-full ${color}`}
        style={{ width: size, height: size }}
      />
      {withText && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
};

export default UserisActiveBadge;
