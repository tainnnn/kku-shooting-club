// components/profile-button.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { createClient } from '@/lib/supabase/client';
import defaultAvatar from '@/components/pic/profile-button.png';

export default function ProfileButton() {
  const supabase = createClient();

  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(defaultAvatar);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!user) {
        setIsLoggedIn(false);
        setImgSrc(defaultAvatar);
        return;
      }

      setIsLoggedIn(true);

      // ตัวอย่างดึง url จาก user_metadata หรือ storage
      let url = (user.user_metadata?.avatar_url as string | undefined) ?? '';

      // ถ้าเก็บเป็น path ใน storage ก็แปลงเป็น public url
      if (!url) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_path')
          .eq('id', user.id)
          .single<{ avatar_path: string | null }>();

        if (profile?.avatar_path) {
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(profile.avatar_path);
          url = data.publicUrl;
        }
      }

      setImgSrc(url || defaultAvatar);
    })();

    return () => { mounted = false; };
  }, [supabase]);

  const href = isLoggedIn ? '/profile' : '/auth/login-condition';

  return (
    <Link href="/content/profile" className="inline-flex">
      <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-border">
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
    </Link>
  );
}
