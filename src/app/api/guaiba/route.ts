import { NextResponse } from "next/server";
import { buscarNivelGuaiba } from "@/lib/ana";

export async function GET() {
  const dados = await buscarNivelGuaiba();
  return NextResponse.json(dados);
}
