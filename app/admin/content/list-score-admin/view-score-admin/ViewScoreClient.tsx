"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type RawScore = {
  faculty: string | null;
  member_name: string;
  competition_gender: "male" | "female";
  total_score: number;
};

export default function ViewScoreAdmin() {
  const searchParams = useSearchParams();
  const competitionId = searchParams.get("competitionId");
  const type = searchParams.get("type"); // individual | team | mixed

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!competitionId || !type) return;

    const fetchData = async () => {
      const { data } = await supabase
        .from("competition_scores")
        .select(
          `
          faculty,
          member_name,
          competition_gender,
          total_score
        `
        )
        .eq("competition_id", competitionId);

      if (!data) return;

      if (type === "individual") {
        setRows(
          [...data].sort(
            (a, b) => b.total_score - a.total_score
          )
        );
        return;
      }

      if (type === "team") {
        const map = new Map<string, number>();

        data.forEach((r) => {
          const key = r.faculty ?? "ไม่ระบุคณะ";
          map.set(
            key,
            (map.get(key) ?? 0) + r.total_score
          );
        });

        setRows(
          Array.from(map.entries())
            .map(([faculty, score]) => ({
              faculty,
              total_score: score,
            }))
            .sort(
              (a, b) => b.total_score - a.total_score
            )
        );
        return;
      }

      // mixed
      const map = new Map<
        string,
        { male?: RawScore; female?: RawScore }
      >();

      data.forEach((r) => {
        const key = r.faculty ?? "ไม่ระบุคณะ";
        const entry = map.get(key) ?? {};

        if (
          r.competition_gender === "male" &&
          (!entry.male ||
            r.total_score > entry.male.total_score)
        ) {
          entry.male = r;
        }

        if (
          r.competition_gender === "female" &&
          (!entry.female ||
            r.total_score >
              entry.female.total_score)
        ) {
          entry.female = r;
        }

        map.set(key, entry);
      });

      setRows(
        Array.from(map.entries())
          .filter(
            ([, v]) => v.male && v.female
          )
          .map(([faculty, v]) => ({
            faculty,
            male: v.male!,
            female: v.female!,
            total_score:
              v.male!.total_score +
              v.female!.total_score,
          }))
          .sort(
            (a, b) => b.total_score - a.total_score
          )
      );
    };

    fetchData();
  }, [competitionId, type, supabase]);

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      <table className="w-full border border-black">
        <thead className="bg-orange-600 text-white">
          <tr>
            <th className="border">อันดับ</th>
            <th className="border">รายละเอียด</th>
            <th className="border">คะแนนรวม</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="text-black">
              <td className="border text-center">
                {i + 1}
              </td>

              <td className="border px-2">
                {type === "individual" &&
                  `${r.member_name} (${r.faculty})`}
                {type === "team" &&
                  `คณะ${r.faculty}`}
                {type === "mixed" &&
                  `คณะ${r.faculty} : ${r.male.member_name} + ${r.female.member_name}`}
              </td>

              <td className="border text-center">
                {r.total_score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
