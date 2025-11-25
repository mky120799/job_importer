import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Job Importer Admin</h1>

      <Link
        href="/import-history"
        className="bg-blue-600 text-white px-4 py-2 rounded w-fit"
      >
        View Import History
      </Link>

      <Link
        href="/api/trigger-import"
        className="bg-green-600 text-white px-4 py-2 rounded w-fit"
      >
        Trigger Import Manually
      </Link>
    </div>
  );
}
