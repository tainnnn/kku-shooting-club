"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";


type Competition = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_open: boolean;
};

function Complist() {
  const [complist, setComplist] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCompetitions = async () => {
      const { data, error } = await supabase
        .from("competitions")
        .select("id, name, start_date, end_date, is_open")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setComplist(data);
      }

      setLoading(false);
    };

    fetchCompetitions();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
      <div className="flex justify-start items-start mx-8 mt-6 mb-3 text-black text-2xl font-medium">
        รายการแข่งขัน
      </div>

      <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">
        {/* loading */}
        {loading && (
          <div className="text-center text-gray-500 py-6">
            กำลังโหลดรายการแข่งขัน...
          </div>
        )}

        {/* empty */}
        {!loading && complist.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            ยังไม่มีรายการแข่งขัน
          </div>
        )}

        {/* list */}
        {complist.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
          >
            <span>
              {item.name} / ({item.start_date} - {item.end_date})
            </span>

            <div className="flex gap-2">
              <button className="flex md:text-sm text-xs border rounded px-2 py-1 text-white bg-blue-400 hover:bg-blue-500">
                รายละเอียด
              </button>

              {item.is_open && (
                <Link
                  href={`/content/complist/register/${item.id}`}
                >
                  <button className="flex md:text-sm text-xs border rounded px-2 py-1 text-white bg-green-400 hover:bg-green-500">
                    สมัครการแข่งขัน
                  </button>
                </Link>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Complist;
