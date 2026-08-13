import { NextResponse } from "next/server";
import { buscarNiveisPortoAlegre, buscarNiveisAfluentes } from "@/lib/ana";

export async function GET() {
  const [portoAlegre, afluentes] = await Promise.all([
    buscarNiveisPortoAlegre(),
    buscarNiveisAfluentes(),
  ]);
  return NextResponse.json({ portoAlegre, afluentes });
}
