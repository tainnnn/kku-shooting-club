"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminContentShell from "@/app/admin/component/AdminContentShell";

function CheckRegisterApproved() {
  const router = useRouter();
  const [showSlip, setShowSlip] = useState(false);

  return (
    <>
      <AdminContentShell title="ตรวจสอบการสมัคร">

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
                <span className="text-green-600">อนุมัติแล้ว</span>
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

              <div className="flex items-center gap-2">
                <span className="font-medium">สลิปการชำระเงิน :</span>
                <button
                  onClick={() => setShowSlip(true)}
                  className="text-xs px-3 py-1 rounded-md
                             border border-blue-500 text-blue-600
                             hover:bg-blue-500 hover:text-white transition"
                >
                  ดูสลิป
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ปุ่มล่าง */}
        <div className="flex justify-end pt-6">
          <button
            onClick={() =>
              router.push("/admin/content/checkreg-admin?tab=approved")
            }
            className="bg-emerald-400 text-white px-6 py-2 rounded-md
                       hover:bg-emerald-500 transition-colors"
          >
            ตกลง
          </button>
        </div>
      </AdminContentShell>

      {/* Popup Slip */}
      {showSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => setShowSlip(false)}
            className="absolute inset-0 bg-black/60"
          />

          <div className="relative bg-white rounded-lg p-4 z-10 max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setShowSlip(false)}
              className="absolute -top-3 -right-3 bg-black text-white
                         rounded-full w-7 h-7 flex items-center justify-center"
            >
              ✕
            </button>

            <img
              src="/mock/slip-example.jpg"
              alt="slip"
              className="max-h-[80vh] w-auto rounded-md"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CheckRegisterApproved;
