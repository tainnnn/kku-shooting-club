import { Suspense } from "react";
import ViewScoreClient from "./ViewClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewScoreClient />
    </Suspense>
  );
}
