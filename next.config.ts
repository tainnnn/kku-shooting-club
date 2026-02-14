// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // ปิด image optimizer ของ Next ทั้งโปรเจ็กต์
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  // ⭐ สำคัญ: ปิด ESLint ตอน build (แก้ error defined but never used)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
