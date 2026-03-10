"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/* ================= types ================= */
type BaseCompetition = {
  competition_name: string;
  competition_type: "prone" | "sitting";
  competition_gender: "male" | "female";
};

type ModeType = "individual" | "team" | "mixed";

type ListItem = BaseCompetition & {
  mode: ModeType;
  is_published: boolean;
};

export default function ListScoreAdminPage() {

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [items, setItems] = useState<ListItem[]>([]);

  /* ================= load list ================= */

  useEffect(() => {

    const fetchData = async () => {

      const { data, error } = await supabase
        .from("competition_scores")
        .select(`
          competition_name,
          competition_type,
          competition_gender,
          is_published,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error || !data) return;

      const baseMap = new Map<
        string,
        BaseCompetition & { is_published: boolean }
      >();

      data.forEach((row) => {

        const key = `${row.competition_name}-${row.competition_type}-${row.competition_gender}`;

        if (!baseMap.has(key)) {

          baseMap.set(key, {
            competition_name: row.competition_name,
            competition_type: row.competition_type,
            competition_gender: row.competition_gender,
            is_published: row.is_published ?? false
          });

        }

      });

      const finalItems: ListItem[] = [];
      const mixedAdded = new Set<string>();

      baseMap.forEach((base) => {

        // individual
        finalItems.push({
          ...base,
          mode: "individual"
        });

        // team
        finalItems.push({
          ...base,
          mode: "team"
        });

        // mixed (ต้องสร้างครั้งเดียวต่อ type)
        const mixedKey =
          `${base.competition_name}-${base.competition_type}`;

        if (!mixedAdded.has(mixedKey)) {

          finalItems.push({
            competition_name: base.competition_name,
            competition_type: base.competition_type,
            competition_gender: base.competition_gender,
            mode: "mixed",
            is_published: base.is_published
          });

          mixedAdded.add(mixedKey);

        }

      });

      setItems(finalItems);

    };

    fetchData();

  }, [supabase]);

  /* ================= helpers ================= */

  const renderTitle = (item: ListItem) => {

    const typeLabel =
      item.competition_type === "prone"
        ? "ท่านอน"
        : "ท่านั่ง";

    const genderLabel =
      item.competition_gender === "male"
        ? "ชาย"
        : "หญิง";

    if (item.mode === "individual") {
      return `การแข่งขัน${item.competition_name} บุคคล ${typeLabel}${genderLabel}`;
    }

    if (item.mode === "team") {
      return `การแข่งขัน${item.competition_name} ทีม ${typeLabel}${genderLabel}`;
    }

    return `การแข่งขัน${item.competition_name} คู่ผสม ${typeLabel}`;
  };

  const handleView = (item: ListItem) => {

    const base =
      `/admin/content/list-score-admin/view-score-admin?name=${encodeURIComponent(
        item.competition_name
      )}&type=${item.competition_type}&mode=${item.mode}`;

    if (item.mode === "mixed") {
      router.push(base);
    } else {
      router.push(`${base}&gender=${item.competition_gender}`);
    }

  };

  /* ================= publish all ================= */

  const isAllPublished =
    items.length > 0 &&
    items.every((i) => i.is_published);

    const handleTogglePublishAll = async () => {

      if (items.length === 0) return;

      const newStatus = !items.every(i => i.is_published);
      const first = items[0];

      const { error } = await supabase
      .from("competition_scores")
      .update({ is_published: newStatus })
      .eq("competition_name", first.competition_name);

      if (error) {
        console.error(error);
        alert("เปลี่ยนสถานะไม่สำเร็จ");
        return;
      }

      setItems(prev =>
        prev.map(i => ({
          ...i,
          is_published: newStatus
        }))
      );
    };

  /* ================= UI ================= */

  return (

    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">

      <div className="flex justify-between items-center mx-8 mt-3 mb-1">

        <div className="text-black text-2xl">
          ผลการแข่งขัน
        </div>

        {items.length > 0 && (

              <button
                onClick={handleTogglePublishAll}
                className={`px-4 py-2 rounded text-white ${
                  isAllPublished
                    ? "bg-red-400 hover:bg-red-500"
                    : "bg-blue-400 hover:bg-blue-500"
                }`}
              >
                {isAllPublished ? "ลบประกาศ" : "ประกาศผล"}
              </button>

        )}

      </div>

      <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">

        {items.length === 0 && (

          <div className="mx-2 my-6 py-8 text-center text-gray-600 border border-dashed border-gray-400 rounded-md bg-white">
            ยังไม่มีผลการแข่งขัน
          </div>

        )}

        {items.map((item, index) => (

          <div
            key={`${item.competition_name}-${item.competition_type}-${item.competition_gender}-${item.mode}-${index}`}
            className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
          >

            <span>{renderTitle(item)}</span>

            <button
              onClick={() => handleView(item)}
              className="flex md:text-sm text-xs border rounded px-2 py-1 text-white bg-green-400 hover:bg-green-500"
            >
              ดูผลการแข่งขัน
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}
