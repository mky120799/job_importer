import React from "react";

export interface Log {
  source: string;
  totalFetched: number;
  totalImported: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs?: string[]; // Use a more specific type instead of 'any'
  timestamp: string;
}

interface LogTableProps {
  logs: Log[];
}

export default function LogTable({ logs }: LogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-lg border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold">
            <th className="p-3 border border-gray-300 text-gray-900">Source</th>
            <th className="p-3 border border-gray-300 text-gray-900">
              Fetched
            </th>
            <th className="p-3 border border-gray-300 text-gray-900">
              Imported
            </th>
            <th className="p-3 border border-gray-300 text-gray-900">New</th>
            <th className="p-3 border border-gray-300 text-gray-900">
              Updated
            </th>
            <th className="p-3 border border-gray-300 text-gray-900">Failed</th>
            <th className="p-3 border border-gray-300 text-gray-900">
              Timestamp
            </th>
          </tr>
        </thead>

        <tbody>
          {logs.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="text-center p-4 text-gray-600 border border-gray-300"
              >
                No import logs found
              </td>
            </tr>
          )}

          {logs.map((log, index) => (
            <tr
              key={`${log.source}-${log.timestamp}-${index}`}
              className="text-sm hover:bg-gray-50"
            >
              <td className="border border-gray-300 p-3 text-gray-900">
                {log.source}
              </td>
              <td className="border border-gray-300 p-3 text-gray-900">
                {log.totalFetched}
              </td>
              <td className="border border-gray-300 p-3 text-gray-900">
                {log.totalImported}
              </td>
              <td className="border border-gray-300 p-3 text-green-600 font-medium">
                {log.newJobs}
              </td>
              <td className="border border-gray-300 p-3 text-blue-600 font-medium">
                {log.updatedJobs}
              </td>
              <td className="border border-gray-300 p-3 text-red-600 font-medium">
                {log.failedJobs?.length ?? 0}
              </td>
              <td className="border border-gray-300 p-3 text-gray-900">
                {new Date(log.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
