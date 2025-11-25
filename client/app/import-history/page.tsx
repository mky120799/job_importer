"use client";

import { useEffect, useState } from "react";
import LogTable, { Log } from "../components/LogTable";
import Pagination from "../components/Pagination";

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/import-history?page=${currentPage}&limit=${limit}`
        );
        if (!response.ok) {
          throw new Error("Failed to load import logs");
        }

        const body = await response.json();
        const nextLogs: Log[] = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
          ? body
          : [];

        if (isMounted) {
          setLogs(nextLogs);
          // Use total from API response, or fallback to estimation
          if (typeof body?.total === "number") {
            setTotalItems(body.total);
          } else if (nextLogs.length === limit) {
            // Estimate if total not provided
            setTotalItems((currentPage + 1) * limit + 1);
          } else {
            setTotalItems(currentPage * limit + nextLogs.length);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load import logs"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [currentPage, limit]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Import History</h1>

      {isLoading && (
        <p className="text-sm text-gray-500" role="status">
          Loading import logs…
        </p>
      )}

      {!isLoading && error && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <>
          <LogTable logs={logs} />
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              limit={limit}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
