'use client'

import Image from "next/image";
import kku_logo from './kku-logo-with-text-th-en.png';
import google_logo from './google-logo.png';
import Link from "next/link";


export default function Page() {
    return (
      <div className="min-h-screen w-full bg-white">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <Image
            src={kku_logo}
            alt="Khon Kaen University Logo"
            className="mb-9 w-full max-w-sm select-none"
            draggable={false}
          />

          {/* Divider: แอดมิน */}
          <div className="mb-3 flex w-full items-center gap-3 text-gray-500 max-w-sm">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm md:text-base">เลือกประเภทผู้สมัคร</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <Link
            href="/auth/register-each-type/kku-student"
            className="mb-5 mt-7 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-gray-600 text-sm font-medium shadow-sm transition hover:shadow-[0_0_10px_5px_rgba(0,0,0,0.05)] md:text-base max-w-sm"
            >
            นักศึกษามหาวิทยาลัยขอนแก่น
            </Link>
          <Link
            href="/auth/register-each-type/kku-member"
            className="mb-5 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-gray-600 text-sm font-medium shadow-sm transition hover:shadow-[0_0_10px_5px_rgba(0,0,0,0.05)] md:text-base max-w-sm"
            >
            บุคคลากรมหาวิทยาลัยขอนแก่น
            </Link>
          <Link
            href="/auth/register-each-type/outsider"
            className="mb-5 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-gray-600 text-sm font-medium shadow-sm transition hover:shadow-[0_0_10px_5px_rgba(0,0,0,0.05)] md:text-base max-w-sm"
            >
            บุคคลภายนอก
            </Link>
        </div>
      </div>
    );
  }
