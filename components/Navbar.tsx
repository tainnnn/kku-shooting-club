'use client'

import React, { useState } from 'react'
import { AuthButton } from './auth-button'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Image from "next/image";
import logo from "@/components/pic/kku-shooting-club-logo.png";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)

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




    <nav className="relative w-full border-b border-b-foreground/10 bg-white text-black">
        <div className="w-full max-w-5xl mx-auto flex items-center p-3 px-5 h-16">
        <div className="hidden md:flex items-center w-full text-sm md:text-lg">
            <div className="flex gap-5 items-center">
            <Link href="/" className='mx-2'>ประกาศ</Link>
            <Link href="/content/complist" className='mx-2'>รายการแข่งขัน</Link>
            <Link href="/content/myreg" className='mx-2'>ใบสมัครของฉัน</Link>
            <Link href="/content/compresult" className='mx-2'>ผลการแข่งขัน</Link>
            <Link href="/content/contact" className='mx-2'>ติดต่อ</Link>
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
            <Link href="/" onClick={() => setMenuOpen(false)}>ประกาศ</Link>
            <Link href="/content/complist" onClick={() => setMenuOpen(false)}>รายการแข่งขัน</Link>
            <Link href="/content/myreg" onClick={() => setMenuOpen(false)}>ใบสมัครของฉัน</Link>
            <Link href="/content/compresult" onClick={() => setMenuOpen(false)}>ผลการแข่งขัน</Link>
            <Link href="/content/contact" onClick={() => setMenuOpen(false)}>ติดต่อ</Link>
            <AuthButton />
        </div>
        )}
    </nav>
    </>
    )
}

export default Navbar
