'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { createBrowserClient } from '@supabase/ssr';

export default function Myreg() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState<boolean | null>(null); // null = ยังไม่รู้, true/false = ผลลัพธ์

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) ต้องมี session
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;

        if (!user) {
          // ไม่ได้ล็อกอิน ก็ถือว่ายังไม่ลงทะเบียน (ให้กดไปที่ /auth/register-condition)
          setHasRegistered(false);
          return;
        }

        // 2) เช็คว่ามีแถวในตาราง user หรือยัง (id = auth.uid())
        const { data, error } = await supabase
          .from('user')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Check registration error:', error);
          setHasRegistered(false);
          return;
        }

        // ถ้ามีแถว = ลงทะเบียนแล้ว
        setHasRegistered(!!data?.id);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [supabase]);

  return (
    <>
      <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white ">
        <Navbar />

        <div className="bg-gray-200 mx-5 my-5 rounded-md p-2
                        flex-auto flex flex-col justify-center items-center
                        text-center text-xl">

          {loading ? (
            <div className="text-gray-400">กำลังตรวจสอบสถานะการลงทะเบียน…</div>
          ) : hasRegistered ? (
            // ----- เคส "ลงทะเบียนแล้ว" → ใช้หน้าว่างตาม Myreg_after_login -----
            <div className="w-full h-full" />
          ) : (
            // ----- เคส "ยังไม่ลงทะเบียน" → ข้อความ + ลิงก์เดิม -----
            <>
              <div className="text-gray-400 mb-2">
                คุณยังไม่ได้ทำการลงทะเบียน
              </div>
              <Link
                href="/auth/register-condition"
                className="text-blue-500 hover:underline"
              >
                คลิกที่นี่เพื่อลงทะเบียน
              </Link>
            </>
          )}

        </div>
      </div>
    </>
  );
}
