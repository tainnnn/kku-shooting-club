'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AuthButton } from './auth-button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import logo from '@/components/pic/kku-shooting-club-logo.png'
import { motion } from 'framer-motion'

const navLinks = [
  { href: '/', label: 'ประกาศ' },
  { href: '/content/complist', label: 'รายการแข่งขัน' },
  { href: '/content/myreg', label: 'ใบสมัครของฉัน' },
  { href: '/content/compresult', label: 'ผลการแข่งขัน' },
  { href: '/content/contact', label: 'ติดต่อ' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  /* =========================
     🔥 LOGIC เดียวกับ ADMIN
     ========================= */

  const [hoverHref, setHoverHref] = useState<string | null>(null)
  const [lockedHref, setLockedHref] = useState<string | null>(null)
  const isHovering = hoverHref !== null

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const activeMatch = useMemo(
    () => navLinks.find(l => isActive(l.href)),
    [pathname]
  )

  const indicatorHref =
  lockedHref ??
  hoverHref ??
  activeMatch?.href ??
  null

  const visualActiveHref =
    lockedHref ??
    activeMatch?.href ??
    null

  const HIDE_ON_PREFIXES = ['/content/profile']
  const hideIndicator =
    !activeMatch ||
    HIDE_ON_PREFIXES.some(p => pathname.startsWith(p))

  /* =========================
     🔥 INDICATOR (เหมือน ADMIN)
     ========================= */

  const containerRef = useRef<HTMLDivElement | null>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const recalc = React.useCallback(() => {
    if (hideIndicator) return

    const parent = containerRef.current
    const el = indicatorHref
      ? linkRefs.current[indicatorHref]
      : null

    if (!parent || !el) return

    const parentRect = parent.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    setIndicator({
      left: elRect.left - parentRect.left,
      width: elRect.width,
    })
  }, [indicatorHref, hideIndicator])

  // useEffect(() => {
  //   recalc()
  // }, [hoverHref])

  // useEffect(() => {
  //   const t = setTimeout(recalc, 0)
  //   return () => clearTimeout(t)
  // }, [hoverHref])

  // useEffect(() => {
  //   const onResize = () => requestAnimationFrame(recalc)
  //   window.addEventListener('resize', onResize)
  //   return () => window.removeEventListener('resize', onResize)
  // }, [recalc])
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
        const t = setTimeout(recalc, 0)
        return () => clearTimeout(t)
      }, [indicatorHref])


  /* =========================
     RENDER
     ========================= */

  return (
    <>
      {/* ==== Brand Header ==== */}
      <header
        aria-label="KKU Shooting Club"
        className="
          relative w-full text-white
          bg-[linear-gradient(100deg,#7d2c1b,#a73b24,#d45c43)]
          !shadow-none
        "
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="flex items-center gap-4 md:gap-6 py-6 md:py-8">
            <div className="grid place-items-center size-20 md:size-24 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/20 shadow">
              <Image
                src={logo}
                alt="KKU Shooting Club Logo"
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
                priority
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-wide drop-shadow leading-tight">
                KKU OPEN SHOOTING CLUB
              </h1>
              <div className="mt-2 flex items-center gap-3 text-white/80">
                <span className="h-[1px] w-10 md:w-14 bg-white/30" />
                <p className="text-xs sm:text-sm md:text-base whitespace-nowrap">
                  ชมรมยิงปืน มหาวิทยาลัยขอนแก่น
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==== Navbar ==== */}
      <nav className="relative w-full border-b border-b-gray-300 bg-white text-black">
        <div className="w-full max-w-5xl mx-auto flex items-center pt-3 pb-1 px-5 h-16">
          {/* Desktop */}
          <div className="hidden md:flex items-center w-full text-sm md:text-lg">
            <div
              ref={containerRef}
              className="relative flex gap-5 items-center pb-3"
            >
              {navLinks.map(link => (
                  <Link
                  key={link.href}
                  href={link.href}
                  ref={el => {
                    linkRefs.current[link.href] = el
                  }}
                  onMouseDown={() => {
                    setLockedHref(link.href)
                    setHoverHref(null)
                  }}
                  onMouseEnter={() => {
                    if (!lockedHref) setHoverHref(link.href)
                  }}
                  onMouseLeave={() => {
                    if (!lockedHref) setHoverHref(null)
                  }}
                  className={[
                    "relative px-1 transition-colors",
                    link.href === visualActiveHref
                    ? "text-red-900 font-semibold"
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

          {/* Mobile toggle */}
          <button
            className="md:hidden ml-auto p-2 text-black"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="absolute right-5 top-full mt-1 md:hidden flex flex-col items-start bg-white border border-gray-200 rounded-lg shadow-md py-4 px-6 space-y-3 text-base z-50">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={
                  link.href === visualActiveHref
                    ? 'font-bold text-red-900 underline underline-offset-4'
                    : 'hover:text-red-700'
                }
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
