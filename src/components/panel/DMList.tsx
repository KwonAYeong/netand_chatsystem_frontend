const DMList = () => {
  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">다이렉트 메시지</h2>
      <ul className="space-y-1">
        <li className="p-2 rounded hover:bg-gray-100 cursor-pointer">@ 권아영</li>
        <li className="p-2 rounded hover:bg-gray-100 cursor-pointer">@ 김형진</li>
      </ul>
    </section>
  );
};

export default DMList;
