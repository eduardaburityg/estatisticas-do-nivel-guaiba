import { buscarNiveisAfluentes } from "@/lib/ana";
import { RiosAfluentesGrid } from "@/components/RiosAfluentesGrid";

export const revalidate = 600;

export default async function RiosPage() {
  const afluentes = await buscarNiveisAfluentes();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Esses rios costumam subir antes do Guaíba, então acompanhar o nível deles ajuda a
        antecipar como o Guaíba deve reagir nas horas seguintes.
      </p>

      <RiosAfluentesGrid estacoes={afluentes} />
    </main>
  );
}
