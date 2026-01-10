import Navbar from "@/app/admin/component/Navbar-admin";


function Compresult() {
    const compresult = [
      {
        title: "ผลการแข่งขันยิงปืน (ยิงปืนเดี่ยวชาย)",
        date: "10/11/2026 - 20/11/2026",
      },
      {
        title: "ผลการแข่งขันยิงปืน (ยิงปืนเดี่ยวหญิง)",
        date: "10/11/2026 - 20/11/2026",
      },
      {
        title: "ผลการแข่งขันยิงปืน (ยิงปืนทีมชาย)",
        date: "21/11/2026 - 25/11/2026",
      },
      {
        title: "ผลการแข่งขันยิงปืน (ยิงปืนทีมหญิง)",
        date: "21/11/2026 - 25/11/2026",
      },
    ];

    return (
      <>
        <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white ">

                <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
                ผลการแข่งขัน
                </div>
                <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">
                {compresult.map((item, index) => (
                    <div
                    key={index}
                    className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
                    >
                        <span>
                            {item.title} / ({item.date})
                        </span>
                        <div className="flex gap-2">
                            <button className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1 text-white bg-green-400 hover:bg-green-500">
                                ผลการแข่งขัน
                            </button>
                        </div>
                    </div>
                ))}
                </div>
            </div>
      </>
    );

  }

export default Compresult;
