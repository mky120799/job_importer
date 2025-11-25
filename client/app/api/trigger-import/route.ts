import axios from "axios";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/getApiBaseUrl";

export async function GET() {
  try {
    const res = await axios.post(`${getApiBaseUrl()}/api/trigger-import`, {});
    return NextResponse.json({
      message: "Import triggered",
      jobId: res.data.jobId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Import trigger failed" },
      { status: 500 }
    );
  }
}
