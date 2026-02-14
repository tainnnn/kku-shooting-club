"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";

type Competition = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

function ComplistAdmin() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const [complist, setComplist] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  // popup ลบ
  const [showConfirm, setShowConfirm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Competition | null>(null);

  /** โหลดรายการแข่งขัน */
  const fetchCompetitions = async () => {
    const { data, error } = await supabase
      .from("competitions")
      .select("id, name, start_date, end_date")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComplist(data);
    } else {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const openModal = (item: Competition) => {
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

  const handleDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from("competitions")
      .delete()
      .eq("id", selectedItem.id);

    if (error) {
      console.error(error);
      alert("ลบการแข่งขันไม่สำเร็จ");
      return;
    }

    closeModal();
    fetchCompetitions(); // refresh list
  };

  return (
    <>
      {/* header */}
      <div className="flex justify-between items-center mx-7 mt-4 mb-2">
        <div className="text-black text-2xl font-medium">
          รายการแข่งขัน (Admin)
        </div>

        <Link href="/admin/content/complist-admin/add-complist">
          <button className="text-xs px-3 py-2 text-white bg-green-500 rounded hover:bg-green-600">
            + เพิ่มรายการแข่งขัน
          </button>
        </Link>
      </div>

      {/* list */}
      <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">
        {loading && (
          <div className="text-center text-gray-500 py-6">
            กำลังโหลดรายการแข่งขัน...
          </div>
        )}

        {!loading && complist.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            ยังไม่มีรายการแข่งขัน
          </div>
        )}

        {complist.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
          >
            <span>
              {item.name} / ({item.start_date} - {item.end_date})
            </span>

            <div className="flex gap-2">
              {/* ปุ่มแบบ client */}
              <button className="md:text-sm text-xs border rounded px-2 py-1 text-white bg-blue-400 hover:bg-blue-500">
                รายละเอียด
              </button>

              {/* ปุ่ม admin */}
              <button
                onClick={() => openModal(item)}
                className="md:text-sm text-xs border rounded px-2 py-1 text-white bg-red-600 hover:bg-red-700"
              >
                ลบการแข่งขัน
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* popup ลบ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={closeModal}
            className={cn(
              "absolute inset-0 bg-black/40 transition-opacity duration-200",
              openConfirm ? "opacity-100" : "opacity-0"
            )}
          />

          <div
            className={cn(
              "relative bg-white rounded-2xl w-[350px] p-6 shadow-xl transition-all",
              openConfirm
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            )}
          >
            <div className="text-center text-lg font-medium mb-4">
              ยืนยันลบการแข่งขัน
            </div>

            <div className="border rounded-md px-3 py-2 text-sm text-gray-700 text-center space-y-1">
              <div className="font-medium">
                {selectedItem?.name}
              </div>
              <div className="text-gray-500">
                {selectedItem?.start_date} - {selectedItem?.end_date}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 text-white py-2 rounded-md hover:bg-gray-400"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                ลบการแข่งขัน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ComplistAdmin;
