import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "0";
    const limit = searchParams.get("limit") || "20";

    const res = await axios.get(
      `${getApiBaseUrl()}/api/import-logs?page=${page}&limit=${limit}`
    );
    return NextResponse.json(res.data);
  } catch (error) {
    console.error("Failed to fetch import logs:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
