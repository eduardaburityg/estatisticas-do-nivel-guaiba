export function NotaDuasReguas() {
  return (
    <p className="text-xs" style={{ color: "var(--text-faint)" }}>
      Porto Alegre tem duas réguas no Guaíba — Usina do Gasômetro e Cais Mauá C6 — e cada uma tem
      seu próprio &quot;zero&quot; de referência, por isso os metros de uma não são comparáveis
      com os da outra. Use o <strong style={{ color: "var(--text-muted)" }}>percentual da cota</strong>{" "}
      pra saber qual está mais perto de transbordar. Outras fontes (MetSul, etc.) também podem
      mostrar valores diferentes pelo mesmo motivo.
    </p>
  );
}
