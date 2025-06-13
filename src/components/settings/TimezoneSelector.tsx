interface Props {
  start: string | undefined;
  end: string | undefined;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
}
const generateTimeOptions = () => {
  const times: string[] = [];

  for (let i = 0; i < 48; i++) {
    const hour24 = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';

    const period = hour24 < 12 ? '오전' : '오후';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    const formatted = `${period} ${hour12.toString().padStart(2, '0')}:${minute}`;
    times.push(formatted);
  }

  return times;
};


const TimezoneSelector = ({ start, end, onChangeStart, onChangeEnd }: Props) => {
  const options = generateTimeOptions();

  return (
    <div className="space-y-2">
     <label className="text-sm font-medium text-gray-700">알림 허용</label>

      <div className="flex space-x-2">
        <select
          value={start}
          onChange={(e) => onChangeStart(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-26"
        >
          {options.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <span className="self-center text-sm">~</span>

        <select
          value={end}
          onChange={(e) => onChangeEnd(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-26"
        >
          {options.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimezoneSelector;
