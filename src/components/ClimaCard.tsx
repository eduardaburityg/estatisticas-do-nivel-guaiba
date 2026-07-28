import type { Clima } from "@/lib/types";
import { CloudRain, Wind, Thermometer } from "lucide-react";

export function ClimaCard({ dados }: { dados: Clima }) {
  return (
    <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <h3 className="font-display text-lg font-semibold">Clima em Porto Alegre</h3>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Fonte: {dados.fonte}
      </p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-display data-readout text-4xl font-bold">
          {Math.round(dados.temperaturaAtualC)}°
        </span>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          sensação de {Math.round(dados.sensacaoC)}°
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col items-center gap-1 rounded-xl py-3" style={{ background: "var(--surface-raised)" }}>
          <CloudRain size={16} style={{ color: "var(--water-bright)" }} />
          <span className="data-readout font-semibold">{dados.chuvaHojeMm} mm</span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>hoje</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl py-3" style={{ background: "var(--surface-raised)" }}>
          <Thermometer size={16} style={{ color: "var(--water-bright)" }} />
          <span className="data-readout font-semibold">{dados.chuvaProximos7DiasMm} mm</span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>7 dias</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl py-3" style={{ background: "var(--surface-raised)" }}>
          <Wind size={16} style={{ color: "var(--water-bright)" }} />
          <span className="data-readout font-semibold">{Math.round(dados.ventoKmh)} km/h</span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>vento</span>
        </div>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
        {dados.previsaoHoraria.map((h) => (
          <div key={h.hora} className="flex shrink-0 flex-col items-center gap-1 text-xs">
            <span style={{ color: "var(--text-faint)" }}>{h.hora}</span>
            <span className="data-readout font-medium">{h.temperaturaC}°</span>
            <span style={{ color: "var(--water-bright)" }}>{h.probabilidadeChuva}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
