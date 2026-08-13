// TODO: melhorar design/conteúdo dessa aba numa próxima etapa
import { AvisoEmergencia } from "@/components/ajuda/AvisoEmergencia";

export default function RedeDeApoioLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-10">
      <div>
        <h1 className="font-display text-2xl font-bold">Rede de apoio</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Peça ajuda não urgente — doações, transporte, abrigo — ou veja pedidos cadastrados na
          sua cidade.
        </p>
      </div>

      <AvisoEmergencia />

      {children}
    </main>
  );
}
