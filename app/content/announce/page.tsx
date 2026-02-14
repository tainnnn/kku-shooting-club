import React from "react";

type Announcement = {
  title: string;
  date: string;
};

function Announce() {
  const announcements: Announcement[] = [];

  return (
    <>
      <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
        ประกาศ
      </div>

      <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">
        {announcements.length === 0 && (
          <div className="mx-2 my-6 py-8 text-center text-gray-600 border border-dashed border-gray-400 rounded-md bg-white">
            ยังไม่มีประกาศ
          </div>
        )}

        {announcements.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
          >
            <span>
              {item.title} / ({item.date})
            </span>
            <button className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1 text-white bg-blue-400 transition-colors duration-150 ease-out hover:bg-blue-500">
              รายละเอียด
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Announce;
