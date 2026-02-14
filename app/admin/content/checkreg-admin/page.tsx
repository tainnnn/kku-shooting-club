import { Suspense } from "react";
import CheckregClient from "./CheckregClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">กำลังโหลด...</div>}>
      <CheckregClient />
    </Suspense>
  );
}
