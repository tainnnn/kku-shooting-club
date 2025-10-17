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

          {/* Divider: เข้าสู่ระบบ */}
          <div className="mb-3 flex w-full items-center gap-3 text-gray-500 max-w-sm">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm md:text-base">เข้าสู่ระบบ</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* Continue with Google */}
            <Link
            href="/auth/login"
            className="mb-10 inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-gray-300 px-5 py-3 text-gray-600 text-sm font-medium shadow-sm transition hover:shadow md:text-base"
            >
              <Image
                src={google_logo}
                alt="Google Logo"
                width={20}
                height={20}
                className="select-none"
                draggable={false}
            />
            Continue with Google
            </Link>

          {/* Divider: แอดมิน */}
          <div className="mb-3 flex w-full items-center gap-3 text-gray-500 max-w-sm">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm md:text-base">เข้าสู่ระบบสำหรับแอดมิน</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* Log in Admin */}
          <Link
            href="/auth/login-admin"
            className="mb-12 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-gray-600 text-sm font-medium shadow-sm transition hover:shadow md:text-base max-w-sm"
            >
            Log in Admin
            </Link>
        </div>
      </div>
    );
  }
