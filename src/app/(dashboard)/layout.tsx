import { buscarNiveisPortoAlegre } from "@/lib/ana";
import type { NivelGuaiba } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { TabBar } from "@/components/TabBar";

export const revalidate = 600;

const PESO_STATUS: Record<NivelGuaiba["status"], number> = { normal: 0, alerta: 1, critico: 2 };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const niveisPoa = await buscarNiveisPortoAlegre();

  const statusGeral = niveisPoa.reduce(
    (pior, atual) => (PESO_STATUS[atual.status] > PESO_STATUS[pior] ? atual.status : pior),
    "normal" as NivelGuaiba["status"]
  );

  return (
    <>
      <SiteHeader status={statusGeral} />
      <TabBar />
      {children}
    </>
  );
}
