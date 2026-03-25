import { NextResponse } from "next/server";
import { getCometTrackerData } from "@/lib/jpl";

export const revalidate = 3600;

export async function GET() {
  try {
    const payload = await getCometTrackerData();
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load NASA/JPL comet data.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
