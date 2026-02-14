"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormField = {
  key: string;
  label: string;
  type: string;
  repeat?: number;
  required?: boolean;
};

type TeamMember = {
  name: string;
  email: string;
  role: "leader" | "member";
};

export default function RegisterPage() {
  const { id } = useParams();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const [competition, setCompetition] = useState<any>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [slip, setSlip] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ------------------------------------------------
  // load competition
  // ------------------------------------------------
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        setLoading(false);
        return;
      }

      setCompetition(data);
      setFields(data.form_schema ?? []);
      setLoading(false);
    };

    load();
  }, [id]);

  // ------------------------------------------------
  // update input
  // ------------------------------------------------
  const updateValue = (
    key: string,
    index: number,
    value: string
  ) => {
    setValues((prev) => {
      const arr = prev[key] ? [...prev[key]] : [];
      arr[index] = value;
      return { ...prev, [key]: arr };
    });
  };

  // ------------------------------------------------
  // submit
  // ------------------------------------------------
  const submit = async () => {
    if (!competition) return;

    if (!competition.is_open) {
      alert("รายการนี้ปิดรับสมัครแล้ว");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนสมัคร");
      return;
    }

    if (!slip) {
      alert("กรุณาแนบสลิปการชำระเงิน");
      return;
    }

    setSubmitting(true);

    // ------------------------------------------------
    // collect team members
    // ------------------------------------------------
    const members: TeamMember[] = [];

    if (competition.competition_type === "team") {
      const leaderEmail = values.leader_email?.[0];

      if (!leaderEmail) {
        alert("กรุณากรอกอีเมลหัวหน้าทีม");
        setSubmitting(false);
        return;
      }

      members.push({
        name: "หัวหน้าทีม",
        email: leaderEmail,
        role: "leader",
      });

      const memberEmails = values.member_email ?? [];

      memberEmails.forEach((email, i) => {
        if (email) {
          members.push({
            name: `ผู้เล่นคนที่ ${i + 2}`,
            email,
            role: "member",
          });
        }
      });

      if (members.length !== competition.team_size) {
        alert(
          `ต้องกรอกอีเมลทั้งหมด ${competition.team_size} คน`
        );
        setSubmitting(false);
        return;
      }

      const emails = members.map((m) => m.email);

      if (new Set(emails).size !== emails.length) {
        alert("อีเมลสมาชิกต้องไม่ซ้ำกัน");
        setSubmitting(false);
        return;
      }
    }

    // ------------------------------------------------
    // create registration
    // ------------------------------------------------
    const { data: reg, error } = await supabase
      .from("registrations")
      .insert({
        competition_id: id,
        user_id: user.id,
        team_name: values.team_name?.[0] ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (!reg || error) {
      alert("เกิดข้อผิดพลาด");
      setSubmitting(false);
      return;
    }

    // ------------------------------------------------
    // upload slip
    // ------------------------------------------------
    const path = `slips/${reg.id}-${Date.now()}.png`;

    await supabase.storage
      .from("payment-slips")
      .upload(path, slip);

    const { data: url } = supabase.storage
      .from("payment-slips")
      .getPublicUrl(path);

    await supabase
      .from("registrations")
      .update({
        slip_url: url.publicUrl,
      })
      .eq("id", reg.id);

    // ------------------------------------------------
    // insert team members
    // ------------------------------------------------
    if (members.length > 0) {
      await supabase
        .from("team_members")
        .insert(
          members.map((m) => ({
            registration_id: reg.id,
            name: m.name,
            email: m.email,
            role: m.role,
          }))
        );
    }

    alert("สมัครเรียบร้อย รอการตรวจสอบ");
    router.push("/content/complist");
  };

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
  if (loading)
    return (
      <div className="py-20 text-center text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (!competition)
    return (
      <div className="py-20 text-center text-red-600">
        ไม่พบรายการแข่งขัน
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">

        {/* header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">
            {competition.name}
          </h1>

          <p className="text-gray-500">
            {competition.competition_type === "team"
              ? `สมัครแบบทีม ${competition.team_size} คน`
              : "สมัครแบบเดี่ยว"}
          </p>

          <div className="text-red-600 text-xl font-semibold">
            ค่าสมัคร {competition.price} บาท
          </div>
        </div>

        {/* dynamic form */}
        {fields.map((field) => {
          const count = field.repeat ?? 1;

          return (
            <div key={field.key}>
              <label className="block mb-1 font-medium">
                {field.label}
                {field.required && (
                  <span className="text-red-500"> *</span>
                )}
              </label>

              {[...Array(count)].map((_, i) => (
                <Input
                  key={i}
                  type={field.type}
                  required={field.required}
                  placeholder={
                    count > 1
                      ? `${field.label} คนที่ ${i + 1}`
                      : field.label
                  }
                  className="mb-2"
                  onChange={(e) =>
                    updateValue(
                      field.key,
                      i,
                      e.target.value
                    )
                  }
                />
              ))}
            </div>
          );
        })}

        {/* payment */}
        <div className="border rounded-lg p-4 bg-gray-50 text-center space-y-3">
          <p className="font-medium">
            แนบหลักฐานการชำระเงิน
          </p>

          <img
            src="/qr-payment.png"
            className="w-48 mx-auto"
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setSlip(e.target.files?.[0] ?? null)
            }
          />
        </div>

        <Button
          onClick={submit}
          disabled={submitting}
          className="w-full text-lg py-6"
        >
          {submitting
            ? "กำลังส่งข้อมูล..."
            : "ชำระเงินค่าสมัคร"}
        </Button>
      </div>
    </div>
  );
}
