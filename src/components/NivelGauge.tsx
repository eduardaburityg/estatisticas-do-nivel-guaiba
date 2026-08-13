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

export function NivelGauge({ dados, compacto = false }: { dados: NivelGuaiba; compacto?: boolean }) {
  const cor = CORES[dados.status];
  const tetoEscala = dados.cotaInundacaoMetros * 1.35;
  const percentualPreenchido = Math.min(100, (dados.nivelAtualMetros / tetoEscala) * 100);
  const percentualAtencao = (dados.cotaAtencaoMetros / tetoEscala) * 100;
  const percentualInundacao = (dados.cotaInundacaoMetros / tetoEscala) * 100;
  const percentualCota = Math.round((dados.nivelAtualMetros / dados.cotaInundacaoMetros) * 100);

  const setaTendencia =
    dados.tendencia === "subindo" ? "↑" : dados.tendencia === "descendo" ? "↓" : "→";

  const alturaTubo = compacto ? "h-40 sm:h-48" : "h-64";
  const larguraTubo = compacto ? "w-16 sm:w-20" : "w-24";
  const tamanhoNumero = compacto ? "text-4xl sm:text-5xl" : "text-6xl sm:text-7xl";
  const padding = compacto ? "p-5" : "p-6 sm:p-8";

  return (
    <div
      className={`flex flex-col gap-5 rounded-2xl border ${padding} sm:flex-row sm:items-center`}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className={`relative mx-auto ${alturaTubo} ${larguraTubo} shrink-0 overflow-hidden rounded-full border-2`}
        style={{ borderColor: "var(--border-strong)", background: "var(--bg-deep)" }}
      >
        <div
          className="absolute left-0 right-0 border-t border-dashed"
          style={{ bottom: `${percentualAtencao}%`, borderColor: "var(--status-alerta)", opacity: 0.6 }}
        />
        <div
          className="absolute left-0 right-0 border-t border-dashed"
          style={{ bottom: `${percentualInundacao}%`, borderColor: "var(--status-critico)", opacity: 0.7 }}
        />
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
            <path d="M0 7 Q 25 0, 50 7 T 100 7 T 150 7 T 200 7 V14 H0 Z" fill={cor} opacity="0.85" />
          </svg>
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left">
        <p className="data-readout text-xs uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
          {dados.estacaoNome}
        </p>
        <div className="mt-1.5 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 sm:justify-start">
          <span className={`font-display data-readout ${tamanhoNumero} font-bold`}>
            {dados.nivelAtualMetros.toFixed(2)}
            <span className="text-xl" style={{ color: "var(--text-muted)" }}>
              {" "}
              m
            </span>
          </span>
          <span className="data-readout text-base font-semibold" style={{ color: "var(--text-muted)" }}>
            {percentualCota}% da cota
          </span>
        </div>

        <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
          <span
            className="data-readout text-sm font-semibold"
            style={{ color: dados.tendencia === "estavel" ? "var(--text-muted)" : cor }}
          >
            {setaTendencia} {Math.abs(dados.variacaoCmPorHora).toFixed(1)} cm/h
          </span>
        </div>

        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          style={{ background: `color-mix(in srgb, ${cor} 16%, transparent)`, color: cor }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: cor }} />
          {ROTULOS[dados.status]}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
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
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
