import type { NivelGuaiba } from "@/lib/types";
import { Waves } from "lucide-react";

const MENSAGENS: Record<NivelGuaiba["status"], string> = {
  normal: "O nível do Guaíba está normal no momento.",
  alerta: "O Guaíba está em nível de atenção — acompanhe as próximas horas.",
  critico: "O Guaíba ultrapassou a cota de inundação. Procure informações da Defesa Civil.",
};

export function SiteHeader({ status }: { status: NivelGuaiba["status"] }) {
  const cor = {
    normal: "var(--status-normal)",
    alerta: "var(--status-alerta)",
    critico: "var(--status-critico)",
  }[status];

  return (
    <header className="border-b" style={{ borderColor: "var(--border)" }}>
      {status !== "normal" && (
        <div
          className="px-6 py-2 text-center text-sm font-medium"
          style={{ background: `color-mix(in srgb, ${cor} 18%, transparent)`, color: cor }}
        >
          {MENSAGENS[status]}
        </div>
      )}
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-6">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: "var(--water-deep)" }}
        >
          <Waves size={18} style={{ color: "var(--water-bright)" }} />
        </span>
        <div>
          <p className="font-display text-lg font-semibold leading-tight">Estatísticas do Nível do Guaíba</p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            Monitor do nível do rio, clima e pontos de apoio no RS
          </p>
        </div>
      </div>
    </header>
  );
}
