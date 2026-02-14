"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function Checkreg() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"pending" | "approved">(
    tabFromUrl === "approved" ? "approved" : "pending"
  );

  useEffect(() => {
    if (tabFromUrl === "approved" || tabFromUrl === "pending") {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const checkreg = [
    {
      title: "การแข่งขันยิงปืน (ยิงปืนเดี่ยวชาย)",
      date: "10/11/2026 - 20/11/2026",
      status: "pending",
    },
    {
      title: "การแข่งขันยิงปืน (ยิงปืนเดี่ยวหญิง)",
      date: "10/11/2026 - 20/11/2026",
      status: "pending",
    },
    {
      title: "การแข่งขันยิงปืน (ยิงปืนทีมชาย)",
      date: "21/11/2026 - 25/11/2026",
      status: "approved",
    },
    {
      title: "การแข่งขันยิงปืน (ยิงปืนทีมหญิง)",
      date: "21/11/2026 - 25/11/2026",
      status: "approved",
    },
  ];

  const filteredList = checkreg.filter(
    (item) => item.status === activeTab
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">

      {/* Tab Navbar */}
      <div className="mx-8 mt-3 flex gap-2 border-b">

        {/* Pending */}
        <button
          onClick={() => {
            setActiveTab("pending");
            router.replace("/admin/content/checkreg-admin?tab=pending");
          }}
          className={`px-4 py-2 rounded-t-md text-sm md:text-base transition-colors
            ${
              activeTab === "pending"
                ? "bg-amber-400 text-white font-semibold"
                : "bg-gray-100 text-gray-600 hover:bg-amber-100"
            }`}
        >
          ที่รออนุมัติ
        </button>

        {/* Approved */}
        <button
          onClick={() => {
            setActiveTab("approved");
            router.replace("/admin/content/checkreg-admin?tab=approved");
          }}
          className={`px-4 py-2 rounded-t-md text-sm md:text-base transition-colors
            ${
              activeTab === "approved"
                ? "bg-emerald-400 text-white font-semibold"
                : "bg-gray-100 text-gray-600 hover:bg-emerald-100"
            }`}
        >
          ที่อนุมัติแล้ว
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-200 mx-5 mt-3 rounded-md p-2">
        {filteredList.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            ไม่มีรายการ
          </div>
        ) : (
          filteredList.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center
                         md:text-xl text-sm text-black
                         mx-2 border border-black bg-white
                         my-3 px-3 py-3 rounded-md"
            >
              <span>
                {item.title} / ({item.date})
              </span>

              {activeTab === "pending" ? (
                <Link href="/admin/content/checkreg-admin/pending">
                  <button
                    className="min-w-[80px] text-xs md:text-sm
                               rounded px-3 py-1
                               text-white bg-amber-400
                               hover:bg-amber-500 transition-colors"
                  >
                    ตรวจสอบ
                  </button>
                </Link>
              ) : (
                <Link href="/admin/content/checkreg-admin/approved">
                  <button
                    className="min-w-[80px] text-xs md:text-sm
                               rounded px-3 py-1
                               text-white bg-emerald-400
                               hover:bg-emerald-500 transition-colors"
                  >
                    ดู
                  </button>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Checkreg;
