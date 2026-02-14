"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Announcement = {
  title: string;
  date: string;
};

function Announce() {
  const announcements: Announcement[] = [];

  /** popup state */
  const [showConfirm, setShowConfirm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    title: string;
    date: string;
  } | null>(null);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setShowConfirm(true);
    requestAnimationFrame(() => setOpenConfirm(true));
  };

  const closeModal = () => {
    setOpenConfirm(false);
    setTimeout(() => {
      setShowConfirm(false);
      setSelectedItem(null);
    }, 200);
  };

  const handleDelete = () => {
    console.log("delete:", selectedItem);
    closeModal();
  };

  return (
    <>
      {/* ปุ่มเพิ่มประกาศ */}
      <div className="flex justify-start items-start mx-7 mt-3 mb-1 text-black text-2xl">
        <Link href="/admin/content/annouce-admin/add-annouce">
          <button className="flex md:text-sm text-xs border rounded mx-2 mb-1 px-2 py-1 text-white bg-green-500 transition-colors duration-150 ease-out hover:bg-green-600">
            เพิ่มประกาศ
          </button>
        </Link>
      </div>

      {/* list */}
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

            <div className="flex gap-2">
              <button className="md:text-sm text-xs border rounded px-2 py-1 text-white bg-blue-400 transition-colors duration-150 ease-out hover:bg-blue-500">
                รายละเอียด
              </button>

              <button
                onClick={() => openModal(item)}
                className="md:text-sm text-xs border rounded px-2 py-1 text-white bg-red-600 transition-colors duration-150 ease-out hover:bg-red-700"
              >
                ลบประกาศ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== popup ลบประกาศ ===== */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            onClick={closeModal}
            className={cn(
              "absolute inset-0 bg-black/40 transition-opacity duration-200",
              openConfirm ? "opacity-100" : "opacity-0"
            )}
          />

          {/* modal */}
          <div
            className={cn(
              "relative bg-white rounded-2xl w-[350px] p-6 shadow-xl",
              "transform transition-all duration-200 ease-out",
              openConfirm
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-2"
            )}
          >
            <div className="text-gray-900 text-center text-lg font-medium mb-4">
              ยืนยันลบประกาศ
            </div>

            <div className="border rounded-md px-3 py-2 text-sm text-gray-700 text-center space-y-1">
              <div className="font-medium">
                {selectedItem?.title || "—"}
              </div>
              <div className="text-gray-500">
                {selectedItem?.date}
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 text-white px-6 py-2 rounded-md transition-colors duration-150 ease-out hover:bg-[#ADB1BA]"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-6 py-2 rounded-md transition-colors duration-150 ease-out hover:bg-red-700"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Announce;
