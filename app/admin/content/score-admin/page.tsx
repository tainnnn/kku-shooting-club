"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Input } from "@/components/ui/input";
import { SelectBox } from "@/components/ui/select-box";

/* ================= types ================= */
type ScoreKey = 5 | 6 | 7 | 8 | 9 | 10;

type RowData = {
  faculty: string;
  name: string;
  scores: Record<ScoreKey, string>;
};

const scoreKeys: ScoreKey[] = [5, 6, 7, 8, 9, 10];

export default function ScoreAdminPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const searchParams = useSearchParams();
  const router = useRouter();

  const competitionIdFromUrl = searchParams.get("competitionId");

  /* ---------- header state ---------- */
  const [competitionName, setCompetitionName] = useState("");

  const [competitionType, setCompetitionType] =
    useState<"prone" | "sitting">("prone");

  const [genderType, setGenderType] =
    useState<"male" | "female">("male");

  const [isSaving, setIsSaving] = useState(false);

  /* ---------- competition id ---------- */
  const competitionIdRef = useRef<string>(
    competitionIdFromUrl ?? crypto.randomUUID()
  );

  /* ---------- table state ---------- */
  const [rows, setRows] = useState<RowData[]>([
    {
      faculty: "",
      name: "",
      scores: { 5: "", 6: "", 7: "", 8: "", 9: "", 10: "" },
    },
  ]);

  /* ---------- utils ---------- */
  const calcTotal = (scores: RowData["scores"]) =>
    scoreKeys.reduce(
      (sum, k) => sum + (Number(scores[k]) || 0) * k,
      0
    );

  /* ---------- row actions ---------- */
  const addRow = () => {
    setRows([
      ...rows,
      {
        faculty: "",
        name: "",
        scores: { 5: "", 6: "", 7: "", 8: "", 9: "", 10: "" },
      },
    ]);
  };

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const sortByTotal = () => {
    setRows(
      [...rows].sort(
        (a, b) => calcTotal(b.scores) - calcTotal(a.scores)
      )
    );
  };

  const updateField = (
    rowIndex: number,
    field: "faculty" | "name",
    value: string
  ) => {
    const newRows = [...rows];
    newRows[rowIndex][field] = value;
    setRows(newRows);
  };

  const updateScore = (
    rowIndex: number,
    key: ScoreKey,
    value: string
  ) => {
    const newRows = [...rows];
    newRows[rowIndex].scores[key] =
      value.replace(/[^0-9]/g, "");
    setRows(newRows);
  };

  /* ---------- LOAD OLD DATA ---------- */
  useEffect(() => {
    if (!competitionIdFromUrl) return;

    const loadOldScores = async () => {
      const { data, error } = await supabase
        .from("competition_scores")
        .select("*")
        .eq("competition_id", competitionIdFromUrl)
        .order("rank", { ascending: true });

      if (error || !data || data.length === 0) return;

      setCompetitionName(data[0].competition_name);
      setCompetitionType(data[0].competition_type);
      setGenderType(data[0].competition_gender);

      setRows(
        data.map((row) => ({
          faculty: row.faculty ?? "",
          name: row.member_name,
          scores: {
            5: row.score5 ? String(row.score5) : "",
            6: row.score6 ? String(row.score6) : "",
            7: row.score7 ? String(row.score7) : "",
            8: row.score8 ? String(row.score8) : "",
            9: row.score9 ? String(row.score9) : "",
            10: row.score10 ? String(row.score10) : "",
          },
        }))
      );
    };

    loadOldScores();
  }, [competitionIdFromUrl, supabase]);

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const competitionId = competitionIdRef.current;

      await supabase
        .from("competition_scores")
        .delete()
        .eq("competition_id", competitionId);

      const sorted = [...rows].sort(
        (a, b) => calcTotal(b.scores) - calcTotal(a.scores)
      );

      const payload = sorted.map((row, index) => ({
        competition_id: competitionId,
        competition_name: competitionName || "ปืนยาวชาวบ้าน 25 เมตร",
        competition_type: competitionType,
        competition_gender: genderType,
        rank: index + 1,
        faculty: row.faculty || null,
        member_name: row.name,
        score5: Number(row.scores[5]) || 0,
        score6: Number(row.scores[6]) || 0,
        score7: Number(row.scores[7]) || 0,
        score8: Number(row.scores[8]) || 0,
        score9: Number(row.scores[9]) || 0,
        score10: Number(row.scores[10]) || 0,
        total_score: calcTotal(row.scores),
      }));

      await supabase.from("competition_scores").insert(payload);

      alert("บันทึกคะแนนเรียบร้อยแล้ว ✅");

      // ✅ redirect กลับหน้าผลการแข่งขัน
      router.push("/admin/content/compresult-admin");
    } catch (err) {
      console.error(err);
      alert("บันทึกคะแนนไม่สำเร็จ ❌");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= UI (UNTOUCHED) ================= */
  return (
    <div className="min-h-screen bg-white px-8 py-6">
      {/* header */}
      <div className="flex gap-6 mb-6">
        <div>
          <label className="block mb-1 font-medium text-gray-800">
            ชื่อการแข่งขัน
          </label>
          <Input
            value={competitionName}
            onChange={(e) => setCompetitionName(e.target.value)}
            className="bg-white text-black w-64"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-800">
            ประเภทการแข่งขัน
          </label>
          <SelectBox
            width="w-[145px]"
            value={competitionType}
            options={[
              { label: "ท่านอน", value: "prone" },
              { label: "ท่านั่ง", value: "sitting" },
            ]}
            onChange={(v) =>
              setCompetitionType(v as "prone" | "sitting")
            }
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-800">
            เพศ
          </label>
          <SelectBox
            width="w-[145px]"
            value={genderType}
            options={[
              { label: "ชาย", value: "male" },
              { label: "หญิง", value: "female" },
            ]}
            onChange={(v) =>
              setGenderType(v as "male" | "female")
            }
          />
        </div>
      </div>

      {/* table */}
      <table className="w-full border-collapse border border-black table-fixed">
        <thead className="bg-orange-600 text-white">
          <tr>
            <th className="border border-black w-[60px]">ลำดับ</th>
            <th className="border border-black w-[180px]">คณะ</th>
            <th className="border border-black w-[260px] text-center">
              ชื่อ-นามสกุล
            </th>

            {scoreKeys.map((k) => (
              <th key={k} className="border border-black w-[80px]">
                {k}
              </th>
            ))}

            <th className="border border-black w-[80px]">
              TOTAL
            </th>
            <th className="border border-black w-[80px]">
              ลบ
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border border-black text-center font-medium text-black">
                {i + 1}
              </td>

              <td className="border border-black">
                <input
                  value={row.faculty}
                  onChange={(e) =>
                    updateField(i, "faculty", e.target.value)
                  }
                  className="w-full px-2 bg-transparent text-black outline-none"
                />
              </td>

              <td className="border border-black">
                <input
                  value={row.name}
                  onChange={(e) =>
                    updateField(i, "name", e.target.value)
                  }
                  className="w-full px-2 bg-transparent text-black outline-none"
                />
              </td>

              {scoreKeys.map((k) => (
                <td key={k} className="border border-black text-center">
                  <input
                    value={row.scores[k]}
                    onChange={(e) =>
                      updateScore(i, k, e.target.value)
                    }
                    className="w-full text-center bg-transparent text-black outline-none"
                  />
                </td>
              ))}

              <td className="border border-black text-center font-semibold text-black">
                {calcTotal(row.scores)}
              </td>

              <td className="border border-black text-center">
                <button
                  onClick={() => deleteRow(i)}
                  className="my-1 px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* actions */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={addRow}
          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Add row
        </button>

        <button
          onClick={sortByTotal}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Sort
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
