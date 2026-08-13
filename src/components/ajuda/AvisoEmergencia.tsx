export function AvisoEmergencia() {
  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm"
      style={{
        background: "var(--status-critico-dim)",
        borderColor: "var(--status-critico)",
        color: "var(--text)",
      }}
    >
      <strong style={{ color: "var(--status-critico)" }}>Isto não é um canal de emergência.</strong>{" "}
      Em risco de vida, alagamento em andamento ou necessidade de resgate, ligue{" "}
      <a href="tel:199" className="font-semibold underline" style={{ color: "var(--status-critico)" }}>
        199
      </a>{" "}
      (Defesa Civil) imediatamente. Esta página é para pedidos de ajuda não urgentes — doações,
      transporte, abrigo.
    </div>
  );
}
