'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import defaultAvatar from '@/components/pic/profile-button.png';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User2 } from 'lucide-react';

const BUCKET = 'avatars';

export default function ProfileButton() {
  const supabase = createClient();
  const router = useRouter();

  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(defaultAvatar);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setIsLoggedIn(false);
        setImgSrc(defaultAvatar);
        setDisplayName(null);
        setEmail(null);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setDisplayName((user.user_metadata?.full_name as string | undefined) ?? null);
      setEmail(user.email ?? null);

      // 1) ดึงพาธรูปจากตาราง "user"
      const { data: row, error } = await supabase
        .from('user')
        .select('avatar_url')
        .eq('id', user.id)
        .single<{ avatar_url: string | null }>();

      let url: string | null = null;

      if (!error && row?.avatar_url) {
        const path = row.avatar_url; // ตัวอย่าง: users/<uid>/avatar/current.jpg

        // 2) สร้างลิงก์จาก storage (รองรับทั้ง private/public)
        //    - ลอง signed URL ก่อน (ใช้ได้กับ private bucket)
        const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
        if (signed.data?.signedUrl) {
          url = `${signed.data.signedUrl}&cb=${Date.now()}`; // cache-busting
        } else {
          // fallback ถ้าบัคเก็ต public
          const pub = supabase.storage.from(BUCKET).getPublicUrl(path);
          url = pub.data.publicUrl ? `${pub.data.publicUrl}?cb=${Date.now()}` : null;
        }
      }

      setImgSrc(url || defaultAvatar);
      setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) return <div className="h-9 w-9 animate-pulse rounded-full bg-muted/50" />;

  if (!isLoggedIn) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open profile menu"
          className="
            inline-flex h-9 w-9 items-center justify-center overflow-hidden
            rounded-full bg-white
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-black/20
            dark:focus-visible:ring-white/30
          "
>
          <span className="relative inline-block h-9 w-9">
            <Image
              src={imgSrc}
              alt="Profile"
              fill
              sizes="36px"
              priority
              className="object-cover"
              onError={() => setImgSrc(defaultAvatar)}
            />
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="
        w-72 p-0 overflow-hidden
        rounded-2xl border border-black/10
        bg-white text-gray-900
        shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]
        dark:bg-white dark:text-gray-900
        [*]:focus:outline-none [*]:focus-visible:outline-none
      "
      >
        <div className="divide-y divide-black/10">
          {/* Header */}
          <div className="px-4 py-2.5">
            <div className="truncate text-sm font-semibold leading-tight">
              {displayName ?? email ?? 'User'}
            </div>
            {email && <div className="truncate text-[12px] text-gray-600">{email}</div>}
          </div>

          {/* โปรไฟล์ของฉัน */}
          <DropdownMenuItem
            asChild
            className="
            px-4 py-2.5 text-[14px] text-gray-900 duration-150 cursor-pointer rounded-none
            hover:bg-gray-100 focus:bg-gray-100
            outline-none focus:outline-none focus-visible:outline-none
          "
          >
            <Link href="/content/profile" className="flex w-full items-center">
              <User2 className="mr-3 h-4 w-4 text-gray-700" />
              <span>โปรไฟล์ของฉัน</span>
            </Link>
          </DropdownMenuItem>

          {/* ออกจากระบบ */}
          <DropdownMenuItem
            onClick={signOut}
            className="
            group
            px-4 py-2.5 text-[14px] duration-150 cursor-pointer rounded-none
            text-red-600 hover:bg-red-50 focus:bg-red-50
            hover:text-red-600 focus:text-red-600
            data-[highlighted]:text-red-600
            outline-none focus:outline-none focus-visible:outline-none
          "
          >
            <LogOut className="mr-3 h-4 w-4 text-red-600" />
            <span>ออกจากระบบ</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
