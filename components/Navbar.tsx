'use client'

import React, { useState } from 'react'
import { AuthButton } from './auth-button'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
    <>
    <div className="flex justify-center items-center h-36 bg-red-900 w-full text-xl md:text-5xl text-white font-semibold">
        KKU OPEN SHOOTING CLUB
    </div>

    <nav className="relative w-full border-b border-b-foreground/10 bg-white text-black">
        <div className="w-full max-w-5xl mx-auto flex items-center p-3 px-5 h-16">
        <div className="hidden md:flex items-center w-full text-sm md:text-lg">
            <div className="flex gap-5 items-center">
            <Link href="/" className='mx-2'>ประกาศ</Link>
            <Link href="/complist" className='mx-2'>รายการแข่งขัน</Link>
            <Link href="/myreg" className='mx-2'>ใบสมัครของฉัน</Link>
            <Link href="/compresult" className='mx-2'>ผลการแข่งขัน</Link>
            <Link href="/contact" className='mx-2'>ติดต่อ</Link>
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
            <Link href="/complist" onClick={() => setMenuOpen(false)}>รายการแข่งขัน</Link>
            <Link href="/myreg" onClick={() => setMenuOpen(false)}>ใบสมัครของฉัน</Link>
            <Link href="/compresult" onClick={() => setMenuOpen(false)}>ผลการแข่งขัน</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>ติดต่อ</Link>
            <AuthButton />
        </div>
        )}
    </nav>
    </>
    )
}

export default Navbar