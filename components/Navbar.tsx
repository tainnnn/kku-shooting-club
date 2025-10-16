import React from 'react'
import { AuthButton } from './auth-button'
import Link from 'next/link'

function Navbar() {
    return (
        <><div className='flex justify-center items-center h-36 bg-red-900 w-full text-6xl text-white font-semibold'>KKU OPEN SHOOTING CLUB</div>
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white text-black">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center text-xl">
                    <Link href={"/"}>ประกาศ</Link>
                    <Link href={"/complist"}>รายการแข่งขัน</Link>
                    <Link href={"/myreg"}>ใบสมัครของฉัน</Link>
                    <Link href={"/compresult"}>ผลการแข่งขัน</Link>
                    <Link href={"/contact"}>ติดต่อ</Link>
                </div>
                <div></div>
                <AuthButton />
            </div>
        </nav></>
    )
}

export default Navbar