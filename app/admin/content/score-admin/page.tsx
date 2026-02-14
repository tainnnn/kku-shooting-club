import { Suspense } from "react";
import ScoreClient from "./ScoreClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">กำลังโหลด...</div>}>
      <ScoreClient />
    </Suspense>
  );
}
