import { NextResponse } from "next/server";
import { getAgencySettings } from "@/services/agencyService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get("subdomain");

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain requis" }, { status: 400 });
  }

  const data = await getAgencySettings(subdomain);
  return NextResponse.json(data);
}