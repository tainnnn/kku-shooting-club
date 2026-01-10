// app/content/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';

type ProfileData = {
  full_name?: string | null;

  student_id?: string | null;
  year?: number | string | null;
  faculty?: string | null;
  major?: string | null;
  kku_mail?: string | null;
  phone?: string | null;

  unit?: string | null;
  unit_position?: string | null;

  job?: string | null;
  address?: string | null;

  avatar_url?: string | null;        // renderable url
  citizen_card_url?: string | null;  // renderable url
  staff_card_url?: string | null;    // renderable url
};

function isEmpty(v: unknown) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  return false;
}

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

function ImageRow({ label, src }: { label: string; src?: string | null }) {
  if (isEmpty(src)) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="rounded-md border border-gray-200 bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src as string} alt={label} className="max-h-52 w-full rounded-md object-contain" />
      </div>
    </div>
  );
}

// ใช้ bucket เดียวตามที่คุณตั้งไว้จริง
const BUCKET = 'avatars';

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) ต้องมี session
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // 2) ดึงข้อมูลจาก "public.user"
        const { data, error } = await supabase
          .from('user')
          .select(`
            prefix, first_name, last_name,
            student_id, year, faculty, major,
            kku_mail, phone,
            unit, unit_position,
            job, address,
            avatar_url, citizen_card_url, staff_card_url,
            email_login
          `)
          .eq('id', user.id)
          .single();

        if (error || !data) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // 3) รวมชื่อ
        const full_name =
          [data.prefix, data.first_name, data.last_name].filter(Boolean).join(' ').trim() || null;

        // 4) helper: storage path -> URL ที่แสดงผลได้ (signed ถ้า private, public URL ถ้า public)
        async function toRenderableUrl(path?: string | null) {
          if (!path || isEmpty(path)) return null;

          // ลอง signed ก่อน (ใช้ได้กับ private)
          const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
          if (signed.data?.signedUrl) return signed.data.signedUrl;

          // ถ้า signed ไม่ได้ ให้ใช้ public URL (กรณี bucket public)
          const pub = supabase.storage.from(BUCKET).getPublicUrl(path);
          return pub.data?.publicUrl ?? null;
        }

        const avatarUrl   = await toRenderableUrl(data.avatar_url);
        const citizenUrl  = await toRenderableUrl(data.citizen_card_url);
        const staffUrl    = await toRenderableUrl(data.staff_card_url);

        const mapped: ProfileData = {
          full_name,
          student_id: data.student_id,
          year: data.year,
          faculty: data.faculty,
          major: data.major,
          kku_mail: data.kku_mail ?? data.email_login, // fallback
          phone: data.phone,
          unit: data.unit,
          unit_position: data.unit_position,
          job: data.job,
          address: data.address,
          avatar_url: avatarUrl,
          citizen_card_url: citizenUrl,
          staff_card_url: staffUrl,
        };

        if (mounted) setProfile(mapped);
      } catch (e) {
        console.error(e);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [supabase]);

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">

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
              {/* Header */}
              <div className="flex items-center gap-4">
                {!isEmpty(profile.avatar_url) && (
                  <div className="h-16 w-16 overflow-hidden rounded-full ring-1 ring-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.avatar_url as string} alt="avatar" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-lg font-medium">
                    {isEmpty(profile.full_name) ? 'ผู้ใช้' : profile.full_name}
                  </div>
                  {!isEmpty(profile.kku_mail) && (
                    <div className="text-sm text-gray-500">{profile.kku_mail}</div>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-gray-200 my-2" />

              {/* นักศึกษา */}
              <Row label="รหัสนักศึกษา" value={profile.student_id} />
              <Row label="ชั้นปี" value={profile.year} />
              <Row label="คณะ" value={profile.faculty} />
              <Row label="สาขา" value={profile.major} />

              {/* ติดต่อ */}
              <Row label="เบอร์โทรติดต่อ" value={profile.phone} />

              {/* บุคลากร */}
              <Row label="สังกัด" value={profile.unit} />
              <Row label="ตำแหน่ง" value={profile.unit_position} />

              {/* บุคคลภายนอก */}
              <Row label="อาชีพ" value={profile.job} />
              <Row label="ที่อยู่" value={profile.address} />

              {/* เอกสารแนบ */}
              <ImageRow label="บัตรประชาชน" src={profile.citizen_card_url ?? undefined} />
              <ImageRow label="บัตรบุคลากรภายใน" src={profile.staff_card_url ?? undefined} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
