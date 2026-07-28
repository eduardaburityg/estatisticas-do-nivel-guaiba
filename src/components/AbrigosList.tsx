import { ExternalLink } from "lucide-react";

export function AbrigosList() {
  return (
    <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <h3 className="font-display text-lg font-semibold">Pontos de apoio</h3>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        A lista de abrigos ativos muda conforme o andamento da enchente. Para não divulgar
        endereços desatualizados, consulte sempre o canal oficial da Defesa Civil abaixo. Para
        telefones de emergência, veja a seção acima.
      </p>

      <a
        href="https://prefeitura.poa.br/defesa-civil"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-3 rounded-xl p-3 transition-colors hover:brightness-110"
        style={{ background: "var(--surface-raised)" }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--water-deep)" }}
        >
          <ExternalLink size={16} style={{ color: "var(--water-bright)" }} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">Site oficial da Defesa Civil de Porto Alegre</p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            prefeitura.poa.br/defesa-civil — lista de abrigos ativos e boletins da enchente.
          </p>
        </div>
      </a>

      {/* TODO: linkar o POACLIMA (plataforma de previsão/alertas da prefeitura) aqui
          quando a URL oficial for confirmada — não inventar o endereço até lá. */}

      <p className="mt-4 text-xs" style={{ color: "var(--text-faint)" }}>
        Este painel não mantém lista própria de abrigos: a relação de pontos ativos é
        divulgada e atualizada pela Defesa Civil em tempo real durante o evento.
      </p>
    </div>
  );
}
