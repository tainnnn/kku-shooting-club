// app/content/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';

type ProfileData = {
  // เติม/แก้ field ให้ตรง schema จริงได้เลย
  full_name?: string | null;
  student_id?: string | null;
  year_level?: string | number | null;
  faculty?: string | null;
  major?: string | null;
  kku_mail?: string | null;

  phone?: string | null;

  unit?: string | null;        // หน่วยงาน/คณะ (สำหรับบุคลากร)
  position?: string | null;    // ตำแหน่ง (สำหรับบุคลากร)

  job?: string | null;         // อาชีพ (สำหรับบุคคลภายนอก)
  address?: string | null;

  // รูปต่าง ๆ (โชว์เฉพาะที่มี)
  avatar_url?: string | null;
  idCard?: string | null;
  kkuIdCard?: string | null;
};

function isEmpty(v: unknown) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  return false;
}

// แถวแสดงข้อมูล: ถ้าไม่มีค่า -> ไม่เรนเดอร์อะไรเลย
function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (isEmpty(value)) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-900">
        {String(value)}
      </div>
    </div>
  );
}

// แถวรูปภาพ (เช่น บัตร/รูปโปรไฟล์): ถ้าไม่มีค่า -> ไม่เรนเดอร์
function ImageRow({ label, src }: { label: string; src?: string | null }) {
  if (isEmpty(src)) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="rounded-md border border-gray-200 bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src as string}
          alt={label}
          className="max-h-52 w-full rounded-md object-contain"
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) เอา user ปัจจุบัน
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // 2) ดึงโปรไฟล์จากตารางของนายท่าน (แก้ชื่อ table/columns ให้ตรงจริง)
        //    ตัวอย่างสมมติ: profiles โดยมี id = user.id
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            full_name,
            student_id,
            year_level,
            faculty,
            major,
            kku_mail,
            phone,
            unit,
            position,
            job,
            address,
            avatar_url,
            idCard,
            kkuId
          `)
          .eq('id', user.id)
          .single<ProfileData>();

        if (error) {
          // ถ้าตาราง/แถวไม่มี ให้ปล่อย profile = null; หน้า UI จะยังแสดงได้
          setProfile(null);
        } else {
          setProfile(data ?? null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [supabase]);

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
      <Navbar />

      <div className="bg-gray-200 mx-5 my-5 rounded-md p-4 flex-1 flex items-stretch overflow-hidden">
        <div className="bg-white flex flex-1 flex-col min-h-full p-4 md:p-6 text-gray-900 rounded-md">
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-gray-400">กำลังโหลดข้อมูล…</div>
          ) : !profile ? (
            <div className="flex-1 items-center flex justify-center py-16 text-gray-400">
              ยังไม่มีข้อมูลโปรไฟล์
            </div>
          ) : (
            <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4">
              {/* ส่วนหัว: รูปโปรไฟล์ (ถ้ามี) + ชื่อ */}
              <div className="flex items-center gap-4">
                {!isEmpty(profile.avatar_url) && (
                  <div className="h-16 w-16 overflow-hidden rounded-full ring-1 ring-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.avatar_url as string}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-lg font-medium">
                    {isEmpty(profile.full_name) ? 'ผู้ใช้' : profile.full_name}
                  </div>
                  {/* แสดงอีเมลมหาลัยถ้ามี */}
                  {!isEmpty(profile.kku_mail) && (
                    <div className="text-sm text-gray-500">{profile.kku_mail}</div>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-gray-200 my-2" />

              {/* กลุ่มข้อมูลนักศึกษา */}
              <Row label="รหัสนักศึกษา" value={profile.student_id} />
              <Row label="ชั้นปี" value={profile.year_level} />
              <Row label="คณะ" value={profile.faculty} />
              <Row label="สาขา" value={profile.major} />

              {/* กลุ่มข้อมูลติดต่อ */}
              <Row label="เบอร์โทรติดต่อ" value={profile.phone} />

              {/* กลุ่มข้อมูลบุคลากร */}
              <Row label="สังกัด" value={profile.unit} />
              <Row label="ตำแหน่ง" value={profile.position} />

              {/* กลุ่มข้อมูลบุคคลภายนอก */}
              <Row label="อาชีพ" value={profile.job} />
              <Row label="ที่อยู่" value={profile.address} />

              {/* เอกสาร/รูปแนบ (แสดงเฉพาะที่มี) */}
              <ImageRow label="บัตรประชาชน" src={profile.idCard ?? undefined} />
              <ImageRow label="บัตรบุคลากรภายใน" src={profile.kkuIdCard ?? undefined} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
