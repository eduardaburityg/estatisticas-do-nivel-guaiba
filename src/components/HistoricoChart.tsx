"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { NivelGuaiba } from "@/lib/types";

export function HistoricoChart({ dados }: { dados: NivelGuaiba }) {
  const serie = dados.historico.map((p) => ({
    hora: new Date(p.dataHora).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    nivel: p.nivelMetros,
  }));

  // Evita poluir o eixo X quando há muitas leituras (ex.: a cada 15 min ao
  // longo de 48h) — mostra no máximo ~8 labels, espaçadas uniformemente.
  const MAX_TICKS_EIXO_X = 8;
  const intervaloEixoX =
    serie.length > MAX_TICKS_EIXO_X ? Math.ceil(serie.length / MAX_TICKS_EIXO_X) - 1 : 0;

  return (
    <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <h3 className="font-display text-lg font-semibold">Histórico recente</h3>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Últimas leituras da estação, em metros.
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={serie} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="nivelGradiente" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--water)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--water)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="hora"
              tick={{ fill: "var(--text-faint)", fontSize: 11 }}
              interval={intervaloEixoX}
              axisLine={{ stroke: "var(--border-strong)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-faint)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 0.1", "dataMax + 0.1"]}
              tickFormatter={(valor) => Number(valor).toFixed(2)}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border-strong)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(valor) => [`${Number(valor).toFixed(2)} m`, "Nível"]}
            />
            <ReferenceLine
              y={dados.cotaAtencaoMetros}
              stroke="var(--status-alerta)"
              strokeDasharray="4 4"
              label={{ value: "Atenção", fill: "var(--status-alerta)", fontSize: 10, position: "insideTopLeft" }}
            />
            <ReferenceLine
              y={dados.cotaInundacaoMetros}
              stroke="var(--status-critico)"
              strokeDasharray="4 4"
              label={{ value: "Inundação", fill: "var(--status-critico)", fontSize: 10, position: "insideTopLeft" }}
            />
            <Area
              type="monotone"
              dataKey="nivel"
              stroke="var(--water-bright)"
              strokeWidth={2}
              fill="url(#nivelGradiente)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
