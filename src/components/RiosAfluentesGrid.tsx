import type { NivelEstacao } from "@/lib/types";

const CORES_STATUS: Record<NivelEstacao["status"], string> = {
  normal: "var(--status-normal)",
  alerta: "var(--status-alerta)",
  critico: "var(--status-critico)",
};

const CORES_RIO: Record<string, string> = {
  Jacuí: "#818cf8",
  Sinos: "#38bdf8",
  Caí: "#c084fc",
  Gravataí: "#f472b6",
  Taquari: "#2dd4bf",
};

function corDoRio(rio: string): string {
  return CORES_RIO[rio] ?? "var(--water-bright)";
}

function rotuloStatus(status: NivelEstacao["status"]): string {
  return status === "normal" ? "Normal" : status === "alerta" ? "Atenção" : "Inundação";
}

function rotuloLocal(e: NivelEstacao): string {
  return e.rio === "Jacuí" ? `Jacuí em ${e.municipio}` : e.municipio;
}

export function RiosAfluentesGrid({ estacoes }: { estacoes: NivelEstacao[] }) {
  if (estacoes.length === 0) return null;

  const grupos = new Map<string, NivelEstacao[]>();
  for (const e of estacoes) {
    if (!grupos.has(e.rio)) grupos.set(e.rio, []);
    grupos.get(e.rio)!.push(e);
  }

  return (
    <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <h3 className="font-display text-lg font-semibold">Rios da bacia do Guaíba</h3>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Jacuí, Sinos, Caí e Gravataí deságuam direto no Guaíba. O Taquari chega pelo Delta do Jacuí.
      </p>

      <div className="mt-5 flex flex-col gap-6">
        {[...grupos.entries()].map(([rio, lista]) => {
          const cor = corDoRio(rio);
          const { relacaoComGuaiba, contribuicaoPercentual } = lista[0];
          const direto = relacaoComGuaiba === "direto";
          const textoBadge = direto
            ? contribuicaoPercentual !== undefined
              ? `Direto · ~${contribuicaoPercentual.toLocaleString("pt-BR")}%`
              : "Direto"
            : "Via Delta do Jacuí";
          const textoTooltip = direto
            ? "Deságua diretamente no Lago Guaíba, sem passar por outro rio antes."
            : "As águas passam pelo Delta do Jacuí antes de chegar ao Guaíba.";

          return (
            <div key={rio}>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cor }} />
                <h4 className="font-display text-base font-semibold" style={{ color: cor }}>
                  Rio {rio}
                </h4>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: direto ? "var(--water-deep)" : "rgba(192, 132, 252, 0.16)",
                    color: direto ? "var(--water-bright)" : "#d8b4fe",
                  }}
                >
                  {textoBadge}
                </span>
                <span
                  tabIndex={0}
                  title={textoTooltip}
                  aria-label={textoTooltip}
                  className="flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full text-[10px] font-semibold"
                  style={{ background: "var(--surface-raised)", color: "var(--text-faint)", border: "1px solid var(--border-strong)" }}
                >
                  i
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((e) => {
                  const corStatus = CORES_STATUS[e.status];
                  const seta = e.tendencia === "subindo" ? "↑" : e.tendencia === "descendo" ? "↓" : "→";

                  return (
                    <div key={e.estacaoCodigo} className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
                      <p className="text-sm font-medium">{rotuloLocal(e)}</p>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display data-readout text-2xl font-bold">
                          {e.nivelAtualMetros.toFixed(2)}
                          <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                            {" "}
                            m
                          </span>
                        </span>
                        <span
                          className="data-readout text-xs"
                          style={{ color: e.tendencia === "estavel" ? "var(--text-muted)" : corStatus }}
                        >
                          {seta} {Math.abs(e.variacaoCmPorHora).toFixed(1)} cm/h
                        </span>
                      </div>

                      <p className="mt-2.5 flex items-center gap-1.5 text-xs" style={{ color: corStatus }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: corStatus }} />
                        {rotuloStatus(e.status)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs" style={{ color: "var(--text-faint)" }}>
        * Cotas de atenção estimadas até confirmação com a Defesa Civil de cada município.
      </p>
    </div>
  );
}
