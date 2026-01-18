"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

function AddComplist() {
  const [compTitle, setCompTitle] = useState("");
  const [compDetail, setCompDetail] = useState("");

  const [openDate, setOpenDate] = useState<Date>(new Date());
  const [closeDate, setCloseDate] = useState<Date>(new Date());

  const [showConfirm, setShowConfirm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    detail?: string;
    date?: string;
  }>({});

  const openModal = () => {
    setShowConfirm(true);
    requestAnimationFrame(() => setOpenConfirm(true));
  };

  const closeModal = () => {
    setOpenConfirm(false);
    setTimeout(() => setShowConfirm(false), 200);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!compTitle.trim()) {
      newErrors.title = "กรุณากรอกชื่อรายการแข่งขัน";
    }

    if (!compDetail.trim()) {
      newErrors.detail = "กรุณากรอกรายละเอียดการแข่งขัน";
    }

    if (openDate > closeDate) {
      newErrors.date = "วันเปิดรับสมัครต้องมาก่อนวันปิดรับสมัคร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <>
      <div className=" w-full flex flex-col overflow-x-hidden bg-white">

        <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
          เพิ่มรายการแข่งขัน
        </div>

        {/* ฟอร์ม */}
        <div className="bg-gray-200 mx-5 mt-2 rounded-md p-6">
          <div className="bg-white rounded-md p-6 space-y-4">

            {/* ชื่อรายการแข่งขัน */}
            <div>
              <label className="block text-black mb-1">ชื่อรายการแข่งขัน</label>
              <Input
                placeholder="ชื่อรายการแข่งขัน"
                value={compTitle}
                onChange={(e) => {
                  setCompTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={cn(
                  errors.title
                    ? "border-red-500 focus-visible:ring-red-600"
                    : "border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                )}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            {/* รายละเอียดการแข่งขัน */}
            <div>
              <label className="block text-black mb-1">รายละเอียดการแข่งขัน</label>
              <textarea
                value={compDetail}
                onChange={(e) => {
                  setCompDetail(e.target.value);
                  setErrors((prev) => ({ ...prev, detail: undefined }));
                  // auto grow
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                rows={4}
                placeholder="รายละเอียด"
                className={cn(
                  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-black placeholder-gray-400",
                  "resize-none overflow-hidden transition duration-150",
                  "focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
                  errors.detail
                    ? "border-red-500 focus:ring-red-600 focus:border-red-600"
                    : "border-gray-300"
                )}
              />
              {errors.detail && (
                <p className="mt-1 text-xs text-red-600">{errors.detail}</p>
              )}
            </div>

            {/* วันเปิด–วันปิดรับสมัคร */}
            <div className="grid grid-flow-col auto-cols-max gap-6">
              {/* วันเปิดรับสมัคร */}
              <div>
                <label className="block text-black mb-1">
                  วันเปิดรับสมัคร
                </label>
                <DatePicker value={openDate} onChange={setOpenDate} />
              </div>

              {/* วันปิดรับสมัคร */}
              <div>
                <label className="block text-black mb-1">
                  วันปิดรับสมัคร
                </label>
                <DatePicker value={closeDate} onChange={setCloseDate} />
                {errors.date && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.date}
                  </p>
                )}
              </div>
            </div>

            {/* ปุ่ม */}
            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/admin/content/complist-admin"
                className="bg-gray-300 text-white px-4 py-2 rounded-md transition-colors duration-200 hover:bg-[#ADB1BA]"
              >
                ยกเลิก
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (validateForm()) openModal();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-md transition-colors duration-200 hover:bg-green-600"
              >
                ยืนยันเพิ่มรายการแข่งขัน
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* ===== popup ยืนยัน ===== */}
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
              ยืนยันเพิ่มรายการแข่งขัน
            </div>

            <div className="border rounded-md px-3 py-2 text-sm text-gray-700 space-y-2">
              <div className="text-center font-medium">{compTitle || "—"}</div>
              <div className="text-center text-gray-500">
                {format(openDate, "dd/MM/yyyy")} -{" "}
                {format(closeDate, "dd/MM/yyyy")}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 text-white py-2 rounded-md transition-colors duration-200 hover:bg-[#ADB1BA]"
              >
                ยกเลิก
              </button>

              <button
                onClick={closeModal}
                className="flex-1 bg-green-500 text-white py-2 rounded-md transition-colors duration-200 hover:bg-green-600"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddComplist;
