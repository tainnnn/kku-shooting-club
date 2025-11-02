// auth-button.tsx
'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import ProfileButton from "./profile-button";

type UserLite = { email: string | null };

export function AuthButton() {
  const supabase = createClient();
  const [user, setUser] = useState<UserLite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ? { email: data.user.email ?? null } : null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUser(session?.user ? { email: session.user.email ?? null } : null);
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [supabase]);

  // skeleton กัน layout shift
  if (loading) return <div className="h-9 w-40" />;

  // มีผู้ใช้: แสดงอีเมล + ปุ่มโปรไฟล์ (ซึ่งมีเมนูและปุ่มออกจากระบบอยู่แล้ว)
  if (user) {
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto mb-3">
        <span
          className="h-9 inline-flex items-center text-sm md:text-base leading-none truncate max-w-[200px]"
          title={user.email ?? undefined}
        >
          {user.email}
        </span>
        <div className="h-9 w-9">
          <ProfileButton />
        </div>
      </div>
    );
  }

  // ไม่มีผู้ใช้: แสดงปุ่มเข้าสู่ระบบของ shadcn/ui (รูปแบบที่ถูกต้อง: Button asChild > Link)
  return (
    <Button
     asChild
     variant="default"
     size="sm"
     className=" !rounded-md !border !border-gray-300 !px-5 !text-gray-600 !text-[13px] !font-[500] !duration-200 !transition !hover:shadow-[0_0_3px_3px_rgba(0,0,0,0.1)]"
     >
      <Link
      href="/auth/login-condition"
      className="mb-2 "
      >เข้าสู่ระบบ</Link>
    </Button>
  );
}
