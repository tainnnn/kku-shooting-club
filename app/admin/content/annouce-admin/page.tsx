import React from 'react'
import Link from "next/link";

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
            <div className="flex justify-start items-start mx-7 mt-3 mb-1 text-black text-2xl">
                  <Link href="/admin/content/annouce-admin/add-annouce">
                  <button
                    className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1
                              text-white bg-green-500 hover:bg-green-600"
                  >
                    เพิ่มประกาศ
                  </button>
                  </Link>
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
                      <div className="flex gap-2">
                          <button className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1 text-white bg-blue-400 hover:bg-blue-500">
                              รายละเอียด
                          </button>
                          <button className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1 text-white bg-[#D30000] hover:bg-[#B20000]">
                              ลบประกาศ
                          </button>
                      </div>
                  </div>
              ))}
              </div>
    </>
  );

}

export default Announce;
