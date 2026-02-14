'use client'

import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-black">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </Suspense>
  );
}
