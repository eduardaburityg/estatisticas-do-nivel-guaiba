import type { ContatoEmergencia } from "@/lib/types";
import contatosEmergencia from "@/data/contatos-emergencia.json";
import { ContatosEmergencia } from "@/components/ContatosEmergencia";

export default function ContatosPage() {
  const contatos = contatosEmergencia as ContatoEmergencia[];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <ContatosEmergencia contatos={contatos} />
    </main>
  );
}
