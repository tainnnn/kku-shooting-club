"use client";

import Navbar from "@/app/admin/component/Navbar-admin";
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function Annouce() {

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [announceDate, setAnnounceDate] = useState<Date>(new Date());
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceDetail, setAnnounceDetail] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const openModal = () => {
    setShowConfirm(true);
    requestAnimationFrame(() => setOpenConfirm(true));
  };

  const closeModal = () => {
    setOpenConfirm(false);
    setTimeout(() => setShowConfirm(false), 200);
  };

  const [errors, setErrors] = useState<{
    title?: string;
    detail?: string;
  }>({});

  /* ================= validate ================= */

  const validateForm = () => {

    const newErrors: typeof errors = {};

    if (!announceTitle.trim()) {
      newErrors.title = "กรุณากรอกชื่อประกาศ";
    }

    if (!announceDetail.trim()) {
      newErrors.detail = "กรุณากรอกรายละเอียด";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  /* ================= save ================= */

  const handleSave = async () => {

    const { error } = await supabase
      .from("announcements")
      .insert({
        title: announceTitle,
        detail_url: announceDetail,
        announce_at: announceDate
      });

    if (error) {
      console.error(error);
      return;
    }

    router.push("/admin/content/annouce-admin");

  };

  return (
    <>

      <div className=" w-full flex flex-col overflow-x-hidden bg-white">

        <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
          เพิ่มประกาศ
        </div>

        {/* กล่องฟอร์ม */}

        <div className="bg-gray-200 mx-5 mt-2 rounded-md p-6">

          <div className="bg-white rounded-md p-6 space-y-4">

            {/* ชื่อประกาศ */}

            <div>

              <label className="block text-black mb-1">
                ชื่อประกาศ
              </label>

              <Input
                placeholder="ชื่อประกาศ"
                value={announceTitle}
                onChange={(e) => {
                  setAnnounceTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={cn(
                  errors.title
                    ? "border-red-500 focus-visible:ring-red-600 focus-visible:border-red-600"
                    : "border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                )}
              />

              {errors.title && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.title}
                </p>
              )}

            </div>

            {/* รายละเอียด */}

            <div>

              <label className="block text-black mb-1">
                รายละเอียด
              </label>

              <textarea
                value={announceDetail}
                onChange={(e) => {

                  setAnnounceDetail(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    detail: undefined
                  }));

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
                <p className="text-xs text-red-600">
                  {errors.detail}
                </p>
              )}

            </div>

            {/* วันที่ประกาศ */}

            <div>

              <label className="block text-black mb-1">
                วันที่ประกาศ
              </label>

              <DatePicker
                value={announceDate}
                onChange={setAnnounceDate}
              />

            </div>

            {/* ปุ่ม */}

            <div className="flex justify-end gap-3 pt-4">

              <Link
                href="/admin/content/annouce-admin"
                className="bg-gray-300 text-white px-4 py-2 rounded-md hover:bg-[#ADB1BA]"
              >
                ยกเลิก
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (validateForm()) {
                    openModal();
                  }
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                ยืนยันเพิ่มประกาศ
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* popup */}

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
              ยืนยันเพิ่มประกาศ
            </div>

            <div className="border rounded-md px-3 py-2 text-sm text-gray-700 text-center space-y-1">

              <div className="font-medium">
                {announceTitle || "—"}
              </div>

              <div className="flex justify-center text-sm text-gray-500">
                <span>
                  {format(announceDate, "dd/MM/yyyy")}
                </span>
              </div>

            </div>

            <div className="flex justify-center gap-3 mt-6">

              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 text-white px-6 py-2 rounded-md hover:bg-[#ADB1BA]"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
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

export default Annouce;
