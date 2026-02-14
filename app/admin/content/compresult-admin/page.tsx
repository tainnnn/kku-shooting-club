"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Navbar from "@/app/admin/component/Navbar-admin";

type CompetitionItem = {
  competition_id: string;
  competition_name: string;
  competition_type: "prone" | "sitting";
  competition_gender: "male" | "female";
  faculty: string | null;
  created_at: string;
};

function Compresult() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [items, setItems] = useState<CompetitionItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("competition_scores")
        .select(
          `
          competition_id,
          competition_name,
          competition_type,
          competition_gender,
          faculty,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error || !data) return;

      const map = new Map<string, CompetitionItem>();

      data.forEach((row) => {
        if (!map.has(row.competition_id)) {
          map.set(row.competition_id, row);
        }
      });

      setItems(Array.from(map.values()));
    };

    fetchData();
  }, [supabase]);

  const renderTitle = (item: CompetitionItem) => {
    const type =
      item.competition_type === "prone" ? "ท่านอน" : "ท่านั่ง";
    const gender =
      item.competition_gender === "male" ? "ชาย" : "หญิง";
    const faculty = item.faculty ?? "ไม่ระบุคณะ";

    return `การแข่งขัน${item.competition_name} ${type}${gender} คณะ${faculty}`;
  };

  return (
    <>

      <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
        <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
          ผลการลงคะแนน
        </div>

        <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">
          {items.map((item) => (
            <div
              key={item.competition_id}
              className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
            >
              <span>{renderTitle(item)}</span>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/admin/content/score-admin?competitionId=${item.competition_id}`
                    )
                  }
                  className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1 text-white bg-blue-400 hover:bg-blue-500"
                >
                  แก้ไข
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Compresult;
