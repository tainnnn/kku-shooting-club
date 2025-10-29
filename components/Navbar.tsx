'use client'

import React, { useState } from 'react'
import { AuthButton } from './auth-button'
import Link from 'next/link'
// 1. Import usePathname
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Image from "next/image";
import logo from "@/components/pic/kku-shooting-club-logo.png";

// 2. สร้าง Array ของ Links เพื่อให้จัดการง่าย
const navLinks = [
  { href: '/', label: 'ประกาศ' },
  { href: '/content/complist', label: 'รายการแข่งขัน' },
  { href: '/content/myreg', label: 'ใบสมัครของฉัน' },
  { href: '/content/compresult', label: 'ผลการแข่งขัน' },
  { href: '/content/contact', label: 'ติดต่อ' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  // 3. เรียกใช้ hook เพื่อเอา path ปัจจุบัน
  const pathname = usePathname()

  // 4. สร้างฟังก์ชันเช็ค active (จัดการกรณีพิเศษของหน้าแรก)
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'; // หน้าแรกต้อง match เป๊ะๆ
    }
    return pathname.startsWith(href); // หน้าอื่นให้ match แบบขึ้นต้น
  };

  return (
    <>
      <div className="flex items-center justify-center h-36 w-full bg-red-900 text-white">
        <div className="flex items-center gap-4 md:gap-6">
          <Image
            src={logo}
            alt="KKU Shooting Club Logo"
            className="h-[120px] w-auto md:h-[120px] lg:h-[120px] object-contain select-none"
            priority
          />
          <span className="whitespace-nowrap font-semibold text-2xl md:text-4xl lg:text-5xl">
            KKU OPEN SHOOTING CLUB
          </span>
        </div>
      </div>

      <nav className="relative w-full border-b border-b-gray-300 bg-white text-black">
        <div className="w-full max-w-5xl mx-auto flex items-center p-3 px-5 h-16">
          <div className="hidden md:flex items-center w-full text-sm md:text-lg">
            <div className="flex gap-5 items-center">
              {/* 5. ใช้ .map() เพื่อสร้าง Links บน Desktop */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  // 6. เพิ่ม class แบบมีเงื่อนไข
                  className={`${isActive(link.href) ? 'font-bold text-red-900 underline underline-offset-[20px] ' : 'hover:text-red-700'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="ml-auto">
              <AuthButton />
            </div>
          </div>

          <button
            className="md:hidden ml-auto p-2 text-black"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="absolute right-5 top-full mt-1 md:hidden flex flex-col items-start bg-white border border-gray-200 rounded-lg shadow-md py-4 px-6 space-y-3 text-base z-50"
          >
            {/* 7. ใช้ .map() เพื่อสร้าง Links บน Mobile */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                // 8. เพิ่ม class แบบมีเงื่อนไข (เหมือนกับ desktop)
                className={isActive(link.href) ? 'font-bold text-red-900 underline underline-offset-4' : 'hover:text-red-700'}
              >
                {link.label}
              </Link>
            ))}
            <AuthButton />
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
