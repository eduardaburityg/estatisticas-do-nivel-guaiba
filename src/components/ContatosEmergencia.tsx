import type { ContatoEmergencia } from "@/lib/types";
import { Phone } from "lucide-react";

export function ContatosEmergencia({ contatos }: { contatos: ContatoEmergencia[] }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
    >
      <h3 className="font-display text-lg font-semibold">Contatos de emergência</h3>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Defesa Civil, Bombeiros e Brigada Militar — toque para ligar.
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {contatos.map((c) => (
          <li key={c.id}>
            
             <a
              href={`tel:${c.telefone}`}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:brightness-110"
              style={{ background: "var(--surface-raised)" }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--status-critico-dim)" }}
              >
                <Phone size={16} style={{ color: "var(--status-critico)" }} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{c.nome}</p>
                <p className="data-readout text-sm font-semibold" style={{ color: "var(--water-bright)" }}>
                  {c.telefoneExibicao}
                </p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  {c.descricao}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs" style={{ color: "var(--text-faint)" }}>
        Fonte: canais oficiais da Prefeitura de Porto Alegre (prefeitura.poa.br/defesa-civil).
      </p>
    </div>
  );
}