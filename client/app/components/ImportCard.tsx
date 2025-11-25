import React from "react";

interface ImportCardProps {
  title: string;
  value: number | string;
  color?: string;
}

export default function ImportCard({ title, value, color }: ImportCardProps) {
  return (
    <div className="p-4 rounded-md shadow bg-white border">
      <p className="text-gray-600 text-sm">{title}</p>
      <h2 className={`text-2xl font-bold ${color ?? "text-black"}`}>{value}</h2>
    </div>
  );
}
