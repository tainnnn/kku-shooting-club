"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import AdminContentShell from "@/app/admin/component/AdminContentShell";

function CheckRegister() {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [showSlip, setShowSlip] = useState(false);

  const openModal = (type: "approve" | "reject") => {
    setActionType(type);
    setShowConfirm(true);
    requestAnimationFrame(() => setOpenConfirm(true));
  };

  const closeModal = () => {
    setOpenConfirm(false);
    setRejectReason("");
    setTimeout(() => setShowConfirm(false), 200);
  };

  return (
    <>
      <AdminContentShell title="ตรวจสอบการสมัคร">
        {/* กล่องหลัก */}

            {/* 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ผู้สมัคร */}
              <div>
                <label className="block text-black mb-2">
                  รายละเอียดผู้สมัคร
                </label>

                <div className="border rounded-md p-4 space-y-2 text-sm text-gray-700">
                  <div><span className="font-medium">ชื่อ :</span> นายตัวอย่าง ผู้สมัคร</div>
                  <div><span className="font-medium">อีเมล :</span> user@email.com</div>
                  <div><span className="font-medium">รายการแข่งขัน :</span> ยิงปืนเดี่ยวชาย</div>
                  <div>
                    <span className="font-medium">สถานะ :</span>{" "}
                    <span className="text-amber-500">รอการตรวจสอบ</span>
                  </div>
                </div>
              </div>

              {/* การชำระเงิน */}
              <div>
                <label className="block text-black mb-2">
                  รายละเอียดการชำระเงิน
                </label>

                <div className="border rounded-md p-4 space-y-3 text-sm text-gray-700">
                  <div><span className="font-medium">วันที่ชำระเงิน :</span> 10/11/2026</div>
                  <div><span className="font-medium">จำนวนเงิน :</span> 500 บาท</div>
                  <div><span className="font-medium">ช่องทาง :</span> โอนผ่านธนาคาร</div>

                  <div>
                  {/* label + button */}
                  <div className="flex mb-2 items-center gap-2 ">
                    <span className="font-medium">
                      สลิปการชำระเงิน :
                    </span>

                    <button
                    type="button"
                    onClick={() => setShowSlip(true)}
                    className="flex justify-left items-start text-xs px-3 py-1 rounded-md
                              border border-blue-500 text-blue-600
                              hover:bg-blue-500 hover:text-white transition-colors duration-150 ease-out"
                  >
                    ดูสลิป
                  </button>
                  </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ปุ่มล่าง */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => openModal("reject")}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700  transition-colors duration-150 ease-out"
              >
                ไม่อนุมัติรายการ
              </button>

              <button
                onClick={() => openModal("approve")}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600  transition-colors duration-150 ease-out"
              >
                อนุมัติรายการ
              </button>
            </div>

      </AdminContentShell>

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
                "relative bg-white rounded-2xl w-[360px] p-6 shadow-xl",
                "transform transition-all duration-200 ease-out",
                openConfirm
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-2"
              )}
            >
              {/* title */}
              <div className="text-gray-800 text-center text-lg font-medium mb-4">
                {actionType === "approve"
                  ? "อนุมัติรายการ"
                  : "ไม่อนุมัติรายการ"}
              </div>

              {/* content */}
              <div className="border rounded-md px-4 py-2 text-sm text-gray-700 space-y-3">
                {/* approve text */}
                {actionType === "approve" && (
                  <p className="text-center">
                    คุณต้องการอนุมัติรายการนี้ใช่หรือไม่
                  </p>
                )}

                {/* reject reason */}
                {actionType === "reject" && (
                  <div className="space-y-1">
                    <label className=" block text-sm text-gray-700 mb-1">
                      เหตุผลที่ไม่อนุมัติ
                    </label>

                    <textarea
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      rows={1}
                      placeholder="ระบุเหตุผลในการไม่อนุมัติ"
                      className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-sm
                                resize-none overflow-hidden
                                focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-white py-2 rounded-md hover:bg-[#ADB1BA]"
                >
                  ยกเลิก
                </button>

                <button
                  onClick={closeModal}
                  className={cn(
                    "flex-1 text-white py-2 rounded-md",
                    actionType === "approve"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        )}

      {/* popup slip */}
      {showSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => setShowSlip(false)}
            className="absolute inset-0 bg-black/60"
          />

          <div className="relative z-10 bg-white rounded-lg p-4 max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setShowSlip(false)}
              className="absolute -top-3 -right-3 bg-black text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <img
              src="/mock/slip-example.jpg"
              alt="slip-full"
              className="max-h-[80vh] w-auto rounded-md"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CheckRegister;
