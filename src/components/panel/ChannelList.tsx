const ChannelList = () => {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">채널</h2>
      <ul className="space-y-1">
        <li className="p-2 rounded hover:bg-gray-100 cursor-pointer"># 일반</li>
        <li className="p-2 rounded hover:bg-gray-100 cursor-pointer"># 프로젝트</li>
      </ul>
    </section>
  );
};

export default ChannelList;
