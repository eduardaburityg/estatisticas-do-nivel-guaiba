"use client";

import type { NivelGuaiba } from "@/lib/types";

const CORES: Record<NivelGuaiba["status"], string> = {
  normal: "var(--status-normal)",
  alerta: "var(--status-alerta)",
  critico: "var(--status-critico)",
};

const ROTULOS: Record<NivelGuaiba["status"], string> = {
  normal: "Nível normal",
  alerta: "Atenção",
  critico: "Inundação",
};

export function NivelGauge({ dados }: { dados: NivelGuaiba }) {
  const cor = CORES[dados.status];
  const tetoEscala = dados.cotaInundacaoMetros * 1.35;
  const percentualPreenchido = Math.min(
    100,
    (dados.nivelAtualMetros / tetoEscala) * 100
  );
  const percentualAtencao = (dados.cotaAtencaoMetros / tetoEscala) * 100;
  const percentualInundacao = (dados.cotaInundacaoMetros / tetoEscala) * 100;

  const setaTendencia =
    dados.tendencia === "subindo" ? "↑" : dados.tendencia === "descendo" ? "↓" : "→";

  return (
    <div className="flex flex-col gap-6 rounded-2xl border p-6 sm:p-8 md:flex-row md:items-center"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      {/* Tubo de nível */}
      <div className="relative mx-auto h-64 w-24 shrink-0 overflow-hidden rounded-full border-2"
        style={{ borderColor: "var(--border-strong)", background: "var(--bg-deep)" }}>
        {/* Marcador de cota de atenção */}
        <div
          className="absolute left-0 right-0 border-t border-dashed"
          style={{
            bottom: `${percentualAtencao}%`,
            borderColor: "var(--status-alerta)",
            opacity: 0.6,
          }}
        />
        {/* Marcador de cota de inundação */}
        <div
          className="absolute left-0 right-0 border-t border-dashed"
          style={{
            bottom: `${percentualInundacao}%`,
            borderColor: "var(--status-critico)",
            opacity: 0.7,
          }}
        />
        {/* Água */}
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-1000 ease-out"
          style={{ height: `${percentualPreenchido}%`, background: cor }}
        >
          <svg
            className="absolute -top-3 left-0 w-[200%] animate-[onda_6s_linear_infinite]"
            height="14"
            viewBox="0 0 200 14"
            preserveAspectRatio="none"
          >
            <path
              d="M0 7 Q 25 0, 50 7 T 100 7 T 150 7 T 200 7 V14 H0 Z"
              fill={cor}
              opacity="0.85"
            />
          </svg>
        </div>
      </div>

      {/* Leitura */}
      <div className="flex-1 text-center md:text-left">
        <p className="data-readout text-xs uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
          Estação {dados.estacaoCodigo} · {dados.estacaoNome}
        </p>
        <div className="mt-2 flex items-baseline justify-center gap-3 md:justify-start">
          <span className="font-display data-readout text-6xl font-bold sm:text-7xl">
            {dados.nivelAtualMetros.toFixed(2)}
            <span className="text-2xl" style={{ color: "var(--text-muted)" }}> m</span>
          </span>
          <span
            className="data-readout text-lg font-semibold"
            style={{ color: dados.tendencia === "estavel" ? "var(--text-muted)" : cor }}
          >
            {setaTendencia} {Math.abs(dados.variacaoCmPorHora).toFixed(1)} cm/h
          </span>
        </div>

        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          style={{ background: `color-mix(in srgb, ${cor} 16%, transparent)`, color: cor }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: cor }} />
          {ROTULOS[dados.status]}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt style={{ color: "var(--text-faint)" }}>Cota de atenção</dt>
            <dd className="data-readout font-semibold">{dados.cotaAtencaoMetros.toFixed(2)} m</dd>
          </div>
          <div>
            <dt style={{ color: "var(--text-faint)" }}>Cota de inundação</dt>
            <dd className="data-readout font-semibold">{dados.cotaInundacaoMetros.toFixed(2)} m</dd>
          </div>
          <div>
            <dt style={{ color: "var(--text-faint)" }}>Atualizado</dt>
            <dd className="data-readout font-semibold">
              {new Date(dados.atualizadoEm).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
        </dl>

        {dados.modoDemonstracao && (
          <p className="mt-4 text-xs" style={{ color: "var(--text-faint)" }}>
            ⚠ Exibindo dados de demonstração — {dados.fonte}.
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes onda {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
