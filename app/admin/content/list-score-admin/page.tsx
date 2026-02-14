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
        .select(
          `
          competition_name,
          competition_type,
          competition_gender,
          is_published,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error || !data) return;

      const baseMap = new Map<string, BaseCompetition & { is_published: boolean }>();

      data.forEach((row) => {
        const key = `${row.competition_name}-${row.competition_type}-${row.competition_gender}`;
        if (!baseMap.has(key)) {
          baseMap.set(key, {
            competition_name: row.competition_name,
            competition_type: row.competition_type,
            competition_gender: row.competition_gender,
            is_published: row.is_published ?? false,
          });
        }
      });

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

  const handleTogglePublish = async (item: ListItem) => {
    const { error } = await supabase
      .from("competition_scores")
      .update({ is_published: !item.is_published })
      .eq("competition_name", item.competition_name)
      .eq("competition_type", item.competition_type)
      .eq("competition_gender", item.competition_gender);

    if (error) {
      alert("เปลี่ยนสถานะไม่สำเร็จ");
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.competition_name === item.competition_name &&
        i.competition_type === item.competition_type &&
        i.competition_gender === item.competition_gender
          ? { ...i, is_published: !i.is_published }
          : i
      )
    );
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
      <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
        ผลการแข่งขัน
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

            <div className="flex gap-2">
              <button
                onClick={() => handleView(item)}
                className="flex md:text-sm text-xs border rounded px-2 py-1 text-white bg-green-400 hover:bg-green-500"
              >
                ดูผลการแข่งขัน
              </button>

              <button
                onClick={() => handleTogglePublish(item)}
                className={`flex md:text-sm text-xs border rounded px-2 py-1 text-white ${
                  item.is_published
                    ? "bg-red-400 hover:bg-red-500"
                    : "bg-blue-400 hover:bg-blue-500"
                }`}
              >
                {item.is_published ? "ลบประกาศ" : "ประกาศผล"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
