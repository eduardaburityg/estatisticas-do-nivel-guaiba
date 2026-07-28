import { NextResponse } from "next/server";
import { buscarClima } from "@/lib/open-meteo";

export async function GET() {
  try {
    const dados = await buscarClima();
    return NextResponse.json(dados);
  } catch (erro) {
    return NextResponse.json(
      { erro: "Não foi possível obter os dados de clima.", detalhe: String(erro) },
      { status: 502 }
    );
  }
}
