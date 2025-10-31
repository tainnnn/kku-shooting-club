'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AuthButton } from './auth-button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import logo from '@/components/pic/kku-shooting-club-logo.png'

const navLinks = [
  { href: '/', label: 'ประกาศ' },
  { href: '/content/complist', label: 'รายการแข่งขัน' },
  { href: '/content/myreg', label: 'ใบสมัครของฉัน' },
  { href: '/content/compresult', label: 'ผลการแข่งขัน' },
  { href: '/content/contact', label: 'ติดต่อ' },
];

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()

    const isActive = (href: string) => {
      if (href === '/') return pathname === '/'
      return pathname.startsWith(href)
    }

    // หาแท็บที่ active จริง ๆ
    const activeMatch = useMemo(() => navLinks.find(l => isActive(l.href)), [pathname])

    // ซ่อนแท่นเลื่อนเมื่อไม่มีแท็บ active (เช่น /content/profile) หรืออยู่หน้าโปรไฟล์
    const HIDE_ON_PREFIXES = ['/content/profile'] // เพิ่มได้
    const hideIndicator = !activeMatch || HIDE_ON_PREFIXES.some(p => pathname.startsWith(p))

    // ใช้สำหรับคำนวณตำแหน่ง (แต่จะไม่วาดถ้า hideIndicator = true)
    const activeHref = activeMatch?.href ?? navLinks[0].href

    // === Sliding underline (desktop) ===
    const containerRef = useRef<HTMLDivElement | null>(null)
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
    const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

    const recalc = React.useCallback(() => {
      if (hideIndicator) return // ถ้าซ่อนอยู่ ไม่ต้องคำนวณ
      const parent = containerRef.current
      const el = linkRefs.current[activeHref]
      if (!parent || !el) return
      const parentRect = parent.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setIndicator({ left: elRect.left - parentRect.left, width: elRect.width })
    }, [activeHref, hideIndicator])

    useEffect(() => { recalc() }, [recalc])
    useEffect(() => {
      const onResize = () => recalc()
      window.addEventListener('resize', onResize)
      const t = setTimeout(recalc, 0)
      return () => { window.removeEventListener('resize', onResize); clearTimeout(t) }
    }, [recalc])

  return (
    <>
      {/* Header แดง + โลโก้ */}
      <div className="flex items-center justify-center h-36 w-full bg-red-900 text-white">
        <div className="flex items-center gap-4 md:gap-6">
          <Image
            src={logo}
            alt="KKU Shooting Club Logo"
            className="h-[120px] w-auto object-contain select-none"
            priority
          />
          <span className="whitespace-nowrap font-semibold text-2xl md:text-4xl lg:text-5xl">
            KKU OPEN SHOOTING CLUB
          </span>
        </div>
      </div>

      <nav className="relative w-full border-b border-b-gray-300 bg-white text-black">
        <div className="w-full max-w-5xl mx-auto flex items-center pt-3 pb-1 px-5 h-16">
          {/* Desktop */}
          <div className="hidden md:flex items-center w-full text-sm md:text-lg">
            {/* ทำ container ตำแหน่ง relative เพื่อวาง indicator */}
            <div
              ref={containerRef}
              className="relative flex gap-5 items-center pb-3" // pb เพื่อให้มีพื้นที่วางแท่นใต้ข้อความ
            >
              {/* ลิงก์ทุกอัน */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => { linkRefs.current[link.href] = el }}
                  className={[
                    "relative px-1 transition-colors",
                    isActive(link.href) ? "text-red-900 font-semibold" : "hover:text-red-700"
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}

              {/* ⬇️ แสดงแท่นเลื่อนเฉพาะเมื่อไม่อยู่หน้าโปรไฟล์ */}
              {!hideIndicator && (
                <div
                  className="pointer-events-none absolute bottom-0 h-[3px] rounded-full bg-red-700 transition-all duration-300 ease-out"
                  style={{ left: indicator.left, width: indicator.width }}
                />
              )}
            </div>

            <div className="ml-auto">
              {/* AuthButton เดิม (อีเมลลิงก์ไป /account) */}
              <AuthButton />
            </div>
          </div>

          {/* Mobile toggle */}
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
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
