"use client";

import { useState } from "react";
import { AjudaForm } from "@/components/ajuda/AjudaForm";
import { AjudaList } from "@/components/ajuda/AjudaList";

export default function RedeDeApoioPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <AjudaForm onEnviado={() => setRefreshKey((k) => k + 1)} />
      <AjudaList refreshKey={refreshKey} />
    </div>
  );
}
