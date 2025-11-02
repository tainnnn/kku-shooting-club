// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // ปิด image optimizer ของ Next ทั้งโปรเจ็กต์ (แก้ปัญหา 400 ได้ทันที)
    unoptimized: true,
    // เผื่อเปิดกลับภายหลัง ก็ใส่ pattern ไว้ด้วย
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

export default nextConfig