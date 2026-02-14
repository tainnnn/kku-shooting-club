"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { SelectBox } from "@/components/ui/select-box";
import { format } from "date-fns";

/* =====================================================
   ✅ เพิ่มเฉพาะ TYPE นี้ (ไม่เกี่ยวกับ UI)
===================================================== */
type FormField = {
  key: string;
  label: string;
  type: string;
  repeat?: number;
  required?: boolean;
};

export default function AddComplist() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  // -------------------------
  // state (เหมือนเดิมทั้งหมด)
  // -------------------------
  const [compTitle, setCompTitle] = useState("");
  const [compDetail, setCompDetail] = useState("");

  const [openDate, setOpenDate] = useState<Date>(new Date());
  const [closeDate, setCloseDate] = useState<Date>(new Date());

  const [competitionType, setCompetitionType] =
    useState<"single" | "team">("single");

  const [genderType, setGenderType] =
    useState<"male" | "female" | "mixed">("mixed");

  const [price, setPrice] = useState<number>(0);
  const [teamSize, setTeamSize] = useState<number>(4);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    detail?: string;
    date?: string;
    price?: string;
    teamSize?: string;
  }>({});

  /* =====================================================
     ✅ เพิ่ม logic ตรงนี้เท่านั้น
  ===================================================== */

  const buildFormSchema = (): FormField[] => {
    // ---------- สมัครเดี่ยว ----------
    if (competitionType === "single") {
      return [
        {
          key: "fullname",
          label: "ชื่อ-นามสกุล",
          type: "text",
          required: true,
        },
        {
          key: "email",
          label: "อีเมลผู้สมัคร",
          type: "email",
          required: true,
        },
      ];
    }

    // ---------- สมัครแบบทีม ----------
    return [
      {
        key: "leader_email",
        label: "อีเมลผู้เล่นคนที่ 1 (หัวหน้าทีม)",
        type: "email",
        required: true,
      },
      {
        key: "member_email",
        label: "อีเมลผู้เล่น",
        type: "email",
        repeat: teamSize - 1,
        required: true,
      },
    ];
  };

  // -------------------------
  // validation (เดิม)
  // -------------------------
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!compTitle.trim())
      newErrors.title = "กรุณากรอกชื่อรายการแข่งขัน";

    if (!compDetail.trim())
      newErrors.detail = "กรุณากรอกรายละเอียดการแข่งขัน";

    if (openDate > closeDate)
      newErrors.date = "วันเปิดรับสมัครต้องมาก่อนวันปิดรับสมัคร";

    if (Number(price) <= 0)
      newErrors.price = "กรุณากรอกค่าสมัคร";

    if (competitionType === "team" && teamSize < 2)
      newErrors.teamSize = "ทีมต้องมีอย่างน้อย 2 คน";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // insert
  // -------------------------
  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ⭐ ตรงนี้คือหัวใจ
    const formSchema = buildFormSchema();

    const { error } = await supabase.from("competitions").insert({
      name: compTitle,
      description: compDetail,
      start_date: openDate,
      end_date: closeDate,
      is_open: true,
      created_by: user?.id ?? null,
      competition_type: competitionType,
      gender_type: genderType,
      price: Number(price),
      team_size: competitionType === "team" ? teamSize : null,

      // ✅ เพิ่มแค่นี้
      form_schema: formSchema,
    });

    if (error) {
      console.error(error);
      alert("เพิ่มรายการแข่งขันไม่สำเร็จ");
      setIsSubmitting(false);
      return;
    }

    alert("เพิ่มรายการแข่งขันเรียบร้อยแล้ว");

    setCompTitle("");
    setCompDetail("");
    setPrice(300);
    setTeamSize(4);
    setCompetitionType("single");
    setGenderType("mixed");

    setIsSubmitting(false);
  };

  // -------------------------
  // UI (เหมือนเดิมทุกบรรทัด)
  // -------------------------
  return (
    <>
      <div className="mx-8 mt-4 text-2xl font-semibold text-gray-800">
        เพิ่มรายการแข่งขัน
      </div>

      <div className="bg-gray-100 mx-5 mt-3 rounded-lg p-6">
        <div className="bg-white rounded-lg p-6 space-y-5">

          {/* ชื่อ */}
          <div>
            <label className="block mb-1 text-gray-800 font-medium">
              ชื่อรายการแข่งขัน
            </label>
            <Input
              value={compTitle}
              onChange={(e) => setCompTitle(e.target.value)}
              className="bg-white text-black"
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block mb-1 text-gray-800 font-medium">
              รายละเอียดการแข่งขัน
            </label>
            <textarea
              value={compDetail}
              onChange={(e) => setCompDetail(e.target.value)}
              className="
                  w-full
                  min-h-[110px]
                  rounded-lg
                  border border-gray-300
                  bg-white
                  text-gray-900
                  p-3
                  resize-none

                  placeholder:text-gray-400

                  focus:outline-none
                  focus:ring-1
                  focus:ring-gray-600
                  focus:border-gray-600
                "
            />
            {errors.detail && (
              <p className="text-xs text-red-600 mt-1">
                {errors.detail}
              </p>
            )}
          </div>

          {/* type + gender */}
          <div className="flex gap-6">
            <div>
              <label className="block mb-1 text-gray-800 font-medium">
                ประเภทการแข่งขัน
              </label>

              <SelectBox
                width="w-[145px]"
                value={competitionType}
                options={[
                  { label: "เดี่ยว", value: "single" },
                  { label: "ทีม", value: "team" },
                ]}
                onChange={(v) =>
                  setCompetitionType(v as "single" | "team")
                }
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-800 font-medium">
                ประเภทเพศ
              </label>

              <SelectBox
                width="w-[145px]"
                value={genderType}
                options={[
                  { label: "ชาย", value: "male" },
                  { label: "หญิง", value: "female" },
                  { label: "ไม่แยกเพศ", value: "mixed" },
                ]}
                onChange={(v) =>
                  setGenderType(v as "male" | "female" | "mixed")
                }
              />
            </div>
          </div>

          {/* ราคา */}
          <div>
            <label className="block mb-1 text-gray-800 font-medium">
              ค่าสมัคร (บาท)
            </label>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={price}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setPrice(Number(value || 0));
                }}
              />
            </div>
          </div>

          {/* team size */}
          {competitionType === "team" && (
            <div>
              <label className="block mb-1 text-gray-800 font-medium">
                จำนวนสมาชิกต่อทีม
              </label>
              <Input
                type="number"
                value={teamSize}
                onChange={(e) =>
                  setTeamSize(Number(e.target.value))
                }
                className="bg-white text-black w-[315px]"
              />
              {errors.teamSize && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.teamSize}
                </p>
              )}
            </div>
          )}

          {/* date */}
          <div className="flex gap-6">
            <div>
              <label className="block mb-1 text-gray-800 font-medium">
                วันเปิดรับสมัคร
              </label>
              <DatePicker value={openDate} onChange={setOpenDate} />
            </div>

            <div>
              <label className="block mb-1 text-gray-800 font-medium">
                วันปิดรับสมัคร
              </label>
              <DatePicker value={closeDate} onChange={setCloseDate} />
              {errors.date && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/admin/content/complist-admin"
              className="px-5 py-2 bg-gray-200 rounded-md text-[#ffffff] hover:bg-gray-300"
            >
              ยกเลิก
            </Link>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white"
            >
              เพิ่มรายการแข่งขัน
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
