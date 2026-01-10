"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function Myreg() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setHasRegistered(false);
          return;
        }

        const { data, error } = await supabase
          .from("registrations")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Check registration error:", error);
          setHasRegistered(false);
          return;
        }

        setHasRegistered(!!data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <div className=" flex-1 flex ">

      <div className="bg-gray-200 mx-5 my-5 rounded-md p-3 flex-1 flex flex-col justify-center items-center text-center text-xl">
        {loading ? (
          <div className="text-gray-400">กำลังตรวจสอบสถานะการลงทะเบียน…</div>
        ) : hasRegistered ? (
          <div className="w-full h-full" />
        ) : (
          <>
            <div className="text-gray-400 mb-2">
              คุณยังไม่ได้สมัครเข้าร่วมการแข่งขัน
            </div>
            <Link
              href="/auth/register-condition"
              className="text-blue-500 hover:underline"
            >
              คลิกที่นี่เพื่อสมัคร
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
