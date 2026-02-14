'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import  AuthButton  from '@/components/auth-button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import logo from '@/components/pic/kku-shooting-club-logo.png'
import { motion } from 'framer-motion'


type navLink = {
  href: string
  label: string
  match: string[]
  priority?: number
}

const getActiveLink = (pathname: string, links: navLink[]) => {
  let best: { link: navLink; length: number } | null = null

  for (const link of links) {
    for (const prefix of link.match) {
      if (pathname.startsWith(prefix)) {
        if (!best || prefix.length > best.length) {
          best = { link, length: prefix.length }
        }
      }
    }
  }

  return best?.link ?? null
}

const navLinks = [
    {
      href: '/admin',
      label: 'ประกาศ',
      match: ['/admin/content/annouce-admin','/admin'],
    },
    // {
    //   href: '/admin/content/complist-admin',
    //   label: 'รายการแข่งขัน',
    //   match: ['/admin/content/complist-admin'],
    // },
    // {
    //   href: '/admin/content/checkreg-admin',
    //   label: 'ตรวจสอบการสมัคร',
    //   match: ['/admin/content/checkreg-admin'],
    // },
    {
      href: '/admin/content/score-admin',
      label: 'ลงคะแนน',
      match: ['/admin/content/score-admin'],
    },
    {
      href: '/admin/content/compresult-admin',
      label: 'ผลการลงคะแนน',
      match: ['/admin/content/compresult-admin'],
    },
    {
      href: '/admin/content/list-score-admin',
      label: 'ผลการแข่งขัน',
      match: ['/admin/content/list-score-admin'],
    },
];

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()

    const [hoverHref, setHoverHref] = useState<string | null>(null)
    const isHovering = hoverHref !== null

    const activeMatch = useMemo(
      () => getActiveLink(pathname, navLinks),
      [pathname]
    )
    const [lockedHref, setLockedHref] = useState<string | null>(null)
    const indicatorHref = lockedHref ?? hoverHref ?? activeMatch?.href

    const visualActiveHref =
      lockedHref ??
      activeMatch?.href ??
      null



    const isActive = (link: navLink) => {
      if (!Array.isArray(link.match)) {
        return pathname === link.href
      }

      // 🔑 เรียง prefix จากยาว → สั้น
      const sorted = [...link.match].sort(
        (a, b) => b.length - a.length
      )

      return sorted.some(prefix => pathname.startsWith(prefix))
    }


    const HIDE_ON_PREFIXES = ['/content/profile']
    const hideIndicator = !activeMatch || HIDE_ON_PREFIXES.some(p => pathname.startsWith(p))
    const activeHref = activeMatch?.href ?? navLinks[0].href

    // === Sliding underline (desktop) ===
    const containerRef = useRef<HTMLDivElement | null>(null)
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
    const [indicator, setIndicator] = useState<{
        left: number
        width: number
      }>({
        left: 0,
        width: 0,
      })



    {/* ⬇️ 1. เพิ่ม State เพื่อเช็กว่าเป็นการโหลดครั้งแรกหรือไม่ */ }
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    const getIndicatorTarget = () => {
      if (!indicatorHref) return null
      return linkRefs.current[indicatorHref] ?? null
    }


    const recalc = React.useCallback(() => {
      if (hideIndicator) return

      const parent = containerRef.current
      const el = getIndicatorTarget()
      if (!parent || !el) return   // ❗ แค่ออก ไม่ reset state

      const parentRect = parent.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()

      setIndicator(prev => ({
        left: elRect.left - parentRect.left,
        width: elRect.width,
      }))
    }, [getIndicatorTarget, hideIndicator])


    useEffect(() => {
        // ใช้ setTimeout เพื่อรอให้ React render DOM ใหม่ให้เสร็จก่อน
        const t = setTimeout(recalc, 0)
        return () => { clearTimeout(t) }
    }, [recalc])

    useEffect(() => {
        const onResize = () => {
            const t = setTimeout(recalc, 0)
            return () => clearTimeout(t)
        }
        window.addEventListener('resize', onResize)
        return () => { window.removeEventListener('resize', onResize) }
    }, [recalc])

    useEffect(() => {
      recalc()
    }, [hoverHref])

    useEffect(() => {
      // route เปลี่ยนแล้วจริง → ปลด lock
      setLockedHref(null)
    }, [pathname])

    useEffect(() => {
      requestAnimationFrame(() => {
        recalc()
      })
    }, [activeHref])

    return (
                <>
      {/* ==== Brand Header (Logo + Title) ==== */}
      <header
        aria-label="KKU Shooting Club"
        className="
          relative w-full text-white
          bg-[linear-gradient(100deg,#7d2c1b,#a73b24,#d45c43)]
          !shadow-none
        "
      >
        {/* subtle vignette / highlight */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="flex items-center gap-4 md:gap-6 py-6 md:py-8">
            {/* Logo */}
            <div
              className="
                grid place-items-center
                size-20 md:size-24
                rounded-full bg-white/10 backdrop-blur
                ring-1 ring-white/20 shadow
              "
              aria-hidden="true"
            >
              <Image
                src={logo}
                alt="KKU Shooting Club Logo"
                className="h-16 w-16 md:h-20 md:w-20 object-contain select-none"
                draggable={false}
                priority
              />
            </div>

            {/* Title block */}
            <div className="min-w-0">
              <h1
                className="
                  text-2xl sm:text-3xl lg:text-5xl
                  font-extrabold tracking-wide
                  drop-shadow
                  leading-tight
                "
              >
                KKU GAMES SHOOTING CLUB - ADMIN
              </h1>

              <div className="mt-2 flex items-center gap-3 text-white/80">
                <span className="h-[1px] w-10 md:w-14 bg-white/30" />
                <p className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                  ชมรมยิงปืน มหาวิทยาลัยขอนแก่น
                </p>
              </div>
            </div>

            {/* เผื่อช่องขวาสำหรับ badge/cta ในอนาคต */}
            <div className="ml-auto hidden md:flex items-center gap-2" />
          </div>
        </div>

        {/* bottom divider  */}
        {/* <div className="h-1 w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0" /> */}
      </header>


            <nav className="relative w-full border-b border-b-gray-300 bg-white text-black">
                <div className="w-full max-w-5xl mx-auto flex items-center pt-3 pb-1 px-5 h-16">
                    {/* Desktop */}
                    <div className="hidden md:flex items-center w-full text-sm md:text-lg">
                        <div
                            ref={containerRef}
                            className="relative flex gap-5 items-center pb-3"
                        >
                            {/* ... (Links) ... */}
                            {navLinks.map((link) => (
                                  <Link
                                  key={link.href}
                                  href={link.href}
                                  ref={(el) => { linkRefs.current[link.href] = el }}

                                  onMouseDown={() => {
                                    setLockedHref(link.href)   // ล็อคก่อน click
                                    setHoverHref(null)
                                  }}

                                  onMouseEnter={() => {
                                    if (!lockedHref) setHoverHref(link.href)
                                  }}
                                  onMouseLeave={() => {
                                    if (!lockedHref) setHoverHref(null)
                                  }}

                                  className={[
                                    "relative px-1 transition-[font-variation-settings,color] duration-300 ease-out",
                                    "font-[450]",

                                    link.href === visualActiveHref
                                      ? "text-red-900 font-[700]"
                                      : "text-black/70 hover:text-red-700"
                                  ].join(" ")}
                                  >
                                  {link.label}
                                  </Link>

                              ))}

                              {!hideIndicator && (
                                      <motion.div
                                      className="pointer-events-none absolute bottom-0 h-[3px] rounded-full bg-red-700"
                                      animate={{
                                        left: indicator.left,
                                        width: indicator.width,
                                      }}
                                      transition={
                                        isHovering
                                          ? { duration: 0.3, ease: "easeOut" }
                                          : {
                                              type: "spring",
                                              stiffness: 150,
                                              damping: 25,
                                              mass: 1.3,
                                            }
                                      }
                                      />
                                )}
                          </div>

                        <div className="ml-auto">
                            <AuthButton />
                        </div>
                    </div>

                    {/* ... (Mobile) ... */}
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
                        className="absolute right-5 top-full mt-1 md:hidden flex flex-col items-start bg-white border border-gray-200 rounded-lg shadow-md py-4 px-6 space-y-3 text-base z-50 "
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={link.href === visualActiveHref ? 'font-bold text-red-900 underline underline-offset-4' : 'hover:text-red-700'}
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
