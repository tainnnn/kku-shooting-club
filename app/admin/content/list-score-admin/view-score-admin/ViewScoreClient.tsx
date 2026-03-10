"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type RawScore = {
  faculty: string | null;
  member_name: string;
  competition_gender: "male" | "female";

  score5: number;
  score6: number;
  score7: number;
  score8: number;
  score9: number;
  score10: number;

  score_x: number;
  total_score: number;
};

export default function ViewScoreAdmin() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name");
  const type = searchParams.get("type");
  const gender = searchParams.get("gender");
  const mode = searchParams.get("mode") as "individual" | "team" | "mixed"

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!name || !type || !gender || !mode) return;

    const fetchData = async () => {

      let query = supabase
        .from("competition_scores")
        .select(`
          faculty,
          member_name,
          competition_gender,
          score5,
          score6,
          score7,
          score8,
          score9,
          score10,
          score_x,
          total_score
        `)
        .eq("competition_name", name)
        .eq("competition_type", type)

      if (mode !== "mixed") {
        query = query.eq("competition_gender", gender)
      }

      const { data, error } = await query

      if (!data || error) return;

      /* ================= INDIVIDUAL ================= */

      if (mode === "individual") {
        const sorted = [...data].sort((a, b) => {
          if (b.total_score !== a.total_score) {
            return b.total_score - a.total_score;
          }
          return b.score_x - a.score_x;
        });

        setRows(sorted);
        return;
      }

      /* ================= TEAM ================= */

      if (mode === "team") {
        const map = new Map<string, RawScore[]>();

        data.forEach((r) => {
          const key = r.faculty ?? "ไม่ระบุคณะ";

          if (!map.has(key)) {
            map.set(key, []);
          }

          map.get(key)!.push(r);
        });

        const teams = Array.from(map.entries()).map(
          ([faculty, members]) => {

            const sortedMembers = [...members].sort((a, b) => {

              if (b.total_score !== a.total_score) {
                return b.total_score - a.total_score
              }

              return b.score_x - a.score_x

            })

            const totalScore = sortedMembers.reduce(
              (sum, m) => sum + m.total_score,
              0
            )

            const totalX = sortedMembers.reduce(
              (sum, m) => sum + m.score_x,
              0
            )

            return {
              faculty,
              members: sortedMembers,
              total_score: totalScore,
              total_x: totalX,
            }

          }
        );

        teams.sort((a, b) => {
          if (b.total_score !== a.total_score) {
            return b.total_score - a.total_score;
          }
          return b.total_x - a.total_x;
        });

        setRows(teams);
        return;
      }

      /* ================= MIXED ================= */

      if (mode === "mixed") {

        const map = new Map<
          string,
          { male?: RawScore; female?: RawScore }
        >()

        data.forEach((r) => {

          const key = r.faculty ?? "ไม่ระบุคณะ"

          const entry = map.get(key) ?? {}

          if (
            r.competition_gender === "male" &&
            (!entry.male ||
              r.total_score > entry.male.total_score)
          ) {
            entry.male = r
          }

          if (
            r.competition_gender === "female" &&
            (!entry.female ||
              r.total_score > entry.female.total_score)
          ) {
            entry.female = r
          }

          map.set(key, entry)

        })

        const mixed = Array.from(map.entries())
          .filter(([_, v]) => v.male && v.female)
          .map(([faculty, v]) => ({

            faculty,

            male: v.male!,
            female: v.female!,

            total_score:
              v.male!.total_score +
              v.female!.total_score,

            total_x:
              v.male!.score_x +
              v.female!.score_x,

          }))
          .sort((a, b) => {

            if (b.total_score !== a.total_score) {
              return b.total_score - a.total_score
            }

            return b.total_x - a.total_x

          })

        setRows(mixed)

        return
      }

    };

    fetchData();
  }, [name, type, gender, mode, supabase]);

  const getRankColor = (i:number)=>{

    if(i===0) return "bg-yellow-400"

    if(i===1) return "bg-gray-300"

    if(i===2) return "bg-red-300"

    return "bg-gray-100"

   }

  return (
    <div className="min-h-screen bg-white px-6 py-4">
          <div className="text-center mb-4 text-black">

            <div className="text-lg font-semibold">
              ผลการแข่งขันกีฬายิงปืน KKU GAMES 2025
            </div>

            <div className="text-md">

              {`ปืน${name} ${
                mode === "individual"
                  ? "ประเภทบุคคล"
                  : mode === "team"
                  ? "ประเภททีม"
                  : "ประเภทคู่ผสม"
              } ระยะ 25 เมตร ${
                type === "prone" ? "ท่านอน" : "ท่านั่ง"
              }${
                mode !== "mixed"
                  ? gender === "male"
                    ? "ชาย"
                    : "หญิง"
                  : ""
              }`}

            </div>

          </div>

      <table className="w-full border border-black text-black">

        <thead className="bg-orange-600 text-white">

          <tr>

            <th className="border">อันดับ</th>
            <th className="border">คณะ</th>
            <th className="border">ชื่อ - สกุล</th>

            <th className="border">5</th>
            <th className="border">6</th>
            <th className="border">7</th>
            <th className="border">8</th>
            <th className="border">9</th>
            <th className="border">10</th>

            <th className="border">X</th>
            <th className="border">รวม</th>

          </tr>

        </thead>

        <tbody>

          {/* INDIVIDUAL */}

          {mode === "individual" &&
            rows.map((r, i) => (
              <tr key={i} className={getRankColor(i)}>

                <td className="border text-center">
                  {i + 1}
                </td>

                <td className="border text-left px-2">
                  {r.faculty}
                </td>

                <td className="border px-2">
                  {r.member_name}
                </td>

                <td className="border text-center px-2">{r.score5}</td>
                <td className="border text-center px-2">{r.score6}</td>
                <td className="border text-center px-2">{r.score7}</td>
                <td className="border text-center px-2">{r.score8}</td>
                <td className="border text-center px-2">{r.score9}</td>
                <td className="border text-center px-2">{r.score10}</td>

                <td className="border text-center px-2">
                  {r.score_x ? `${r.score_x}x` : "-"}
                </td>

                <td className="border text-center px-2">
                  {r.total_score}
                </td>

              </tr>
            ))}

          {/* TEAM */}

          {mode === "team" &&
            rows.map((team, i) => (
              <>
                <tr
                  key={team.faculty}
                  className={`${getRankColor(i)} font-bold`}
                >

                  <td className="border text-center">
                    {i + 1}
                  </td>

                  <td className="border text-center">
                    {team.faculty}
                  </td>

                  <td className="border"></td>

                  <td className="border"></td>
                  <td className="border"></td>
                  <td className="border"></td>
                  <td className="border"></td>
                  <td className="border"></td>
                  <td className="border"></td>

                  <td className="border text-center">
                    {team.total_x ? `${team.total_x}x` : "-"}
                  </td>

                  <td className="border text-center">
                    {team.total_score}
                  </td>

                </tr>

                {team.members.map((m: RawScore, j: number) => (

                  <tr key={j}>

                    <td className="border"></td>
                    <td className="border"></td>

                    <td className="border px-2">
                      {m.member_name}
                    </td>

                    <td className="border text-center px-2">{m.score5}</td>
                    <td className="border text-center px-2">{m.score6}</td>
                    <td className="border text-center px-2">{m.score7}</td>
                    <td className="border text-center px-2">{m.score8}</td>
                    <td className="border text-center px-2">{m.score9}</td>
                    <td className="border text-center px-2">{m.score10}</td>

                    <td className="border text-center px-2">
                      {m.score_x ? `${m.score_x}x` : "-"}
                    </td>

                    <td className="border text-center px-2">
                      {m.total_score}
                    </td>

                  </tr>

                ))}

              </>
            ))}

{/* MIXED */}

{mode === "mixed" &&
  rows.map((team, i) => (
    <>
      <tr
        key={team.faculty}
        className={`${getRankColor(i)} font-bold`}
      >

        <td className="border text-center">
          {i + 1}
        </td>

        <td className="border text-center">
          {team.faculty}
        </td>

        <td className="border"></td>

        <td className="border"></td>
        <td className="border"></td>
        <td className="border"></td>
        <td className="border"></td>
        <td className="border"></td>
        <td className="border"></td>

        <td className="border text-center">
          {team.total_x ? `${team.total_x}x` : "-"}
        </td>

        <td className="border text-center">
          {team.total_score}
        </td>

      </tr>

      {/* MALE */}

      <tr>

        <td className="border"></td>
        <td className="border"></td>

        <td className="border px-2">
          {team.male.member_name}
        </td>

        <td className="border text-center px-2">{team.male.score5}</td>
        <td className="border text-center px-2">{team.male.score6}</td>
        <td className="border text-center px-2">{team.male.score7}</td>
        <td className="border text-center px-2">{team.male.score8}</td>
        <td className="border text-center px-2">{team.male.score9}</td>
        <td className="border text-center px-2">{team.male.score10}</td>

        <td className="border text-center px-2">
          {team.male.score_x ? `${team.male.score_x}x` : "-"}
        </td>

        <td className="border text-center px-2">
          {team.male.total_score}
        </td>

      </tr>

      {/* FEMALE */}

      <tr>

        <td className="border"></td>
        <td className="border"></td>

        <td className="border px-2">
          {team.female.member_name}
        </td>

        <td className="border text-center px-2">{team.female.score5}</td>
        <td className="border text-center px-2">{team.female.score6}</td>
        <td className="border text-center px-2">{team.female.score7}</td>
        <td className="border text-center px-2">{team.female.score8}</td>
        <td className="border text-center px-2">{team.female.score9}</td>
        <td className="border text-center px-2">{team.female.score10}</td>

        <td className="border text-center px-2">
          {team.female.score_x ? `${team.female.score_x}x` : "-"}
        </td>

        <td className="border text-center px-2">
          {team.female.total_score}
        </td>

      </tr>

    </>
))}

        </tbody>

      </table>

    </div>
  );
}
