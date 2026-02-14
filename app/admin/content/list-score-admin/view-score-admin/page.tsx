import { Suspense } from "react";
import ViewScoreClient from "./ViewScoreClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">กำลังโหลด...</div>}>
      <ViewScoreClient />
    </Suspense>
  );
}
