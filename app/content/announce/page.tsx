"use client";

import React, { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  detail: string;
  date: string;
};

function Announce() {

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  /** popup */
  const [showDetail, setShowDetail] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);

  /* ================= auto link detect ================= */

  const renderTextWithLinks = (text: string) => {

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    const parts = text.split(urlRegex);

    return parts.map((part, index) => {

      if (part.match(urlRegex)) {

        const href = part.startsWith("http") ? part : `https://${part}`;

        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {part}
          </a>
        );
      }

      return part;

    });

  };

  /* ================= load announcements ================= */

  useEffect(() => {

    const fetchAnnouncements = async () => {

      const { data, error } = await supabase
        .from("announcements")
        .select(`
          id,
          title,
          detail_url,
          announce_at
        `)
        .order("announce_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        detail: item.detail_url,
        date: format(new Date(item.announce_at), "dd/MM/yyyy")
      }));

      setAnnouncements(formatted);

    };

    fetchAnnouncements();

  }, [supabase]);

  /* ================= popup ================= */

  const openModal = (item: Announcement) => {
    setSelectedItem(item);
    setShowDetail(true);
    requestAnimationFrame(() => setOpenDetail(true));
  };

  const closeModal = () => {
    setOpenDetail(false);
    setTimeout(() => {
      setShowDetail(false);
      setSelectedItem(null);
    }, 200);
  };

  return (
    <>
      <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
        ประกาศ
      </div>

      <div className="bg-gray-200 mx-5 mt-2 rounded-md p-2">

        {announcements.length === 0 && (

          <div className="mx-2 my-6 py-8 text-center text-gray-600 border border-dashed border-gray-400 rounded-md bg-white">
            ยังไม่มีประกาศ
          </div>

        )}

        {announcements.map((item) => (

          <div
            key={item.id}
            className="flex justify-between items-center md:text-xl text-sm text-black mx-2 border border-black bg-white my-3 px-2 py-3 rounded-md"
          >

            <span>
              { item.title }   ( {item.date} )
            </span>

            <button
              onClick={() => openModal(item)}
              className="flex md:text-sm text-xs border rounded mx-2 px-2 py-1 text-white bg-blue-400 hover:bg-blue-500"
            >
              รายละเอียด
            </button>

          </div>

        ))}

      </div>

      {/* ===== popup รายละเอียด ===== */}

      {showDetail && (

        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* backdrop */}

          <div
            onClick={closeModal}
            className={cn(
              "absolute inset-0 bg-black/40 transition-opacity duration-200",
              openDetail ? "opacity-100" : "opacity-0"
            )}
          />

          {/* modal */}

          <div
            className={cn(
              "relative bg-white rounded-2xl w-[420px] p-6 shadow-xl",
              "transform transition-all duration-200 ease-out",
              openDetail
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-2"
            )}
          >

            <div className="text-gray-900 text-center text-lg font-medium mb-4">
              {selectedItem?.title}
            </div>

            <div className="text-sm text-gray-700 whitespace-pre-line border rounded-md p-3 mb-4">
              {selectedItem?.detail &&
                renderTextWithLinks(selectedItem.detail)}
            </div>

            <div className="text-center text-gray-500 text-sm mb-4">
              {selectedItem?.date}
            </div>

            <button
              onClick={closeModal}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              ปิด
            </button>

          </div>

        </div>

      )}

    </>
  );
}

export default Announce;
