// auth-button.tsx
'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";

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
      <Button asChild variant="link" size="lg" className="px-0">
        <Link href="/content/profile" aria-label="ไปที่หน้าบัญชีผู้ใช้">
          {user.email}
        </Link>
      </Button>
      <div className="w-full md:w-auto">
        <LogoutButton />
      </div>
    </div>
  ) : (
    <Button asChild size="sm" variant="outline">
      <Link href="/auth/login-condition">เข้าสู่ระบบ</Link>
    </Button>
  );
}
