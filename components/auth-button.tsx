// auth-button.tsx
'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
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

  if (loading) return <div className="h-9 w-28" />;

  return user ? (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto mb-3">
    <span
        className="h-9 inline-flex items-center text-sm md:text-base leading-none truncate max-w-[200px]"
        title={user.email ?? undefined}
      >
        {user.email}
      </span>
      <button aria-label="ไปที่หน้าบัญชีผู้ใช้" className="inline-flex">
        <div className="h-9 w-9">
          <ProfileButton />
        </div>
      </button>
    </div>
  ) : (
    <Link href="/auth/login-condition" className="inline-flex">
      <Button asChild size="sm" variant="outline" className="h-9">
        <span>เข้าสู่ระบบ</span>
      </Button>
    </Link>
  );
}
