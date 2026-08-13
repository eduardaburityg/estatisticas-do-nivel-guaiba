import { buscarNiveisPortoAlegre } from "@/lib/ana";
import { buscarClima } from "@/lib/open-meteo";
import { NivelGauge } from "@/components/NivelGauge";
import { NotaDuasReguas } from "@/components/NotaDuasReguas";
import { HistoricoChart } from "@/components/HistoricoChart";
import { ClimaCard } from "@/components/ClimaCard";
import { AbrigosList } from "@/components/AbrigosList";

export const revalidate = 600;

export default async function PainelPage() {
  const [niveisPoa, clima] = await Promise.all([buscarNiveisPortoAlegre(), buscarClima().catch(() => null)]);

  const estacaoPrincipal =
    [...niveisPoa].sort((a, b) => b.nivelAtualMetros / b.cotaInundacaoMetros - a.nivelAtualMetros / a.cotaInundacaoMetros)[0] ??
    niveisPoa[0];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid gap-4 lg:grid-cols-2">
        {niveisPoa.map((nivel) => (
          <NivelGauge key={nivel.estacaoCodigo} dados={nivel} compacto />
        ))}
      </div>
      <NotaDuasReguas />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {estacaoPrincipal && <HistoricoChart dados={estacaoPrincipal} />}
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

      <footer className="mt-6 text-center text-xs" style={{ color: "var(--text-faint)" }}>
        Dados de nível: ANA — Rede Hidrometeorológica Nacional. Clima: Open-Meteo. Este painel é
        um projeto pessoal e não substitui os canais oficiais da Defesa Civil.
      </footer>
    </main>
  );
}
