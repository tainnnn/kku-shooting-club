"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Navbar from "@/app/admin/component/Navbar-admin";

/* ================= types ================= */
type BaseCompetition = {
  competition_name: string;
  competition_type: "prone" | "sitting";
  competition_gender: "male" | "female";
};

type ModeType = "individual" | "team" | "mixed";

type ListItem = BaseCompetition & {
  mode: ModeType;
};

export default function ListScoreAdminPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const [items, setItems] = useState<ListItem[]>([]);

  /* ================= load list ================= */
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("competition_scores")
        .select(
          `
          competition_name,
          competition_type,
          competition_gender,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error || !data) return;

      /**
       * STEP 1:
       * รวมข้อมูลให้เหลือแค่
       * (ชื่อการแข่งขัน + ประเภท + เพศ)
       */
      const baseMap = new Map<string, BaseCompetition>();

      data.forEach((row) => {
        const key = `${row.competition_name}-${row.competition_type}-${row.competition_gender}`;
        if (!baseMap.has(key)) {
          baseMap.set(key, {
            competition_name: row.competition_name,
            competition_type: row.competition_type,
            competition_gender: row.competition_gender,
          });
        }
      });

      /**
       * STEP 2:
       * ต่อ 1 ชุด → สร้าง 3 item
       * (บุคคล / ทีม / คู่ผสม)
       */
      const finalItems: ListItem[] = [];

      baseMap.forEach((base) => {
        finalItems.push(
          { ...base, mode: "individual" },
          { ...base, mode: "team" },
          { ...base, mode: "mixed" }
        );
      });

      setItems(finalItems);
    };

    fetchData();
  }, [supabase]);

  /* ================= helpers ================= */
  const renderTitle = (item: ListItem) => {
    const typeLabel =
      item.competition_type === "prone" ? "ท่านอน" : "ท่านั่ง";
    const genderLabel =
      item.competition_gender === "male" ? "ชาย" : "หญิง";

    if (item.mode === "individual") {
      return `การแข่งขัน${item.competition_name} บุคคล ${typeLabel}${genderLabel}`;
    }

    if (item.mode === "team") {
      return `การแข่งขัน${item.competition_name} ทีม ${typeLabel}${genderLabel}`;
    }

    return `การแข่งขัน${item.competition_name} คู่ผสม ${typeLabel}`;
  };

  const handleView = (item: ListItem) => {
    router.push(
      `/admin/content/list-score-admin/view-score-admin?name=${encodeURIComponent(
        item.competition_name
      )}&type=${item.competition_type}&gender=${item.competition_gender}&mode=${item.mode}`
    );
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
        <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
          ผลการลงคะแนน
        </div>

        <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">
          {items.map((item, index) => (
            <div
              key={`${item.competition_name}-${item.competition_type}-${item.competition_gender}-${item.mode}-${index}`}
              className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
            >
              <span>{renderTitle(item)}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleView(item)}
                  className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1 text-white bg-green-400 hover:bg-green-500"
                >
                  ดูผลการแข่งขัน
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
