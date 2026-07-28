import { buscarNivelGuaiba, buscarNiveisAfluentes } from "@/lib/ana";
import { buscarClima } from "@/lib/open-meteo";
import type { ContatoEmergencia } from "@/lib/types";
import contatosEmergencia from "@/data/contatos-emergencia.json";
import { SiteHeader } from "@/components/SiteHeader";
import { NivelGauge } from "@/components/NivelGauge";
import { HistoricoChart } from "@/components/HistoricoChart";
import { ClimaCard } from "@/components/ClimaCard";
import { AbrigosList } from "@/components/AbrigosList";
import { ContatosEmergencia } from "@/components/ContatosEmergencia";
import { RiosAfluentesGrid } from "@/components/RiosAfluentesGrid";
import SolicitacoesAjuda from "@/components/SolicitacoesAjuda";

export const revalidate = 600;

export default async function Home() {
  const [nivel, clima, afluentes] = await Promise.all([
    buscarNivelGuaiba(),
    buscarClima().catch(() => null),
    buscarNiveisAfluentes(),
  ]);
  const contatos = contatosEmergencia as ContatoEmergencia[];

  return (
    <>
      <SiteHeader status={nivel.status} />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <NivelGauge dados={nivel} />

        <RiosAfluentesGrid estacoes={afluentes} />

        <ContatosEmergencia contatos={contatos} />

        <div className="grid gap-6 md:grid-cols-2">
          <HistoricoChart dados={nivel} />
          {clima ? (
            <ClimaCard dados={clima} />
          ) : (
            <div
              className="flex items-center justify-center rounded-2xl border p-6 text-sm"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              Não foi possível carregar os dados de clima agora.
            </div>
          )}
        </div>

        <AbrigosList />

        <SolicitacoesAjuda />

        <footer className="mt-6 text-center text-xs" style={{ color: "var(--text-faint)" }}>
          Dados de nível: {nivel.fonte}. Clima: Open-Meteo. Este painel é um projeto
          pessoal e não substitui os canais oficiais da Defesa Civil.
        </footer>
      </main>
    </>
  );
}