import React from 'react'

function Announce() {
  // ต้องไปทำแบบที่ link กับระบบ admin
  const announcements = [
    {
      title: "กฎการแข่งขัน (ยิงปืนเดี่ยวชาย)",
      date: "10/11/2026 - 20/11/2026",
    },
    {
      title: "กฎการแข่งขัน (ยิงปืนทีม)",
      date: "21/11/2026 - 25/11/2026",
    },
    {
      title: "ตารางแข่งขันรอบชิงชนะเลิศ",
      date: "26/11/2026",
    },
  ];

  return (
    <>
      <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
        ประกาศ
      </div>
      <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">
        {announcements.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
          >
            <span>
              {item.title} / ({item.date})
            </span>
            <button className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1 text-white bg-blue-400 hover:bg-blue-500">
              รายละเอียด
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Announce;
