import React from "react";

interface AdminContentShellProps {
  title: string;
  children: React.ReactNode;
}

export default function AdminContentShell({
  title,
  children,
}: AdminContentShellProps) {
  return (
    <div className="w-full flex flex-col overflow-x-hidden bg-white">
      {/* title */}
      <div className="flex justify-start items-start mx-8 mt-3 mb-1 text-black text-2xl">
        {title}
      </div>

      {/* outer gray box */}
      <div className="bg-gray-200 mx-5 mt-2 rounded-md p-6">
        {/* inner white box */}
        <div className="bg-white rounded-md p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
