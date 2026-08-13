"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Droplets, HeartHandshake, Phone } from "lucide-react";

const ABAS = [
  { href: "/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/rios", label: "Rios", icon: Droplets },
  { href: "/rede-de-apoio", label: "Rede de apoio", icon: HeartHandshake },
  { href: "/contatos", label: "Contatos", icon: Phone },
];

export function TabBar() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const ativaRef = useRef<HTMLAnchorElement>(null);
  const [podeRolarDireita, setPodeRolarDireita] = useState(false);

  function atualizarFade() {
    const el = containerRef.current;
    if (!el) return;
    const sobra = el.scrollWidth - el.clientWidth - el.scrollLeft;
    setPodeRolarDireita(sobra > 4);
  }

  useEffect(() => {
    atualizarFade();
    window.addEventListener("resize", atualizarFade);
    return () => window.removeEventListener("resize", atualizarFade);
  }, []);

  // Ao trocar de aba (inclusive clicando direto num item fora da área
  // visível), rola a tab ativa pra dentro da área visível da tab bar —
  // `inline`/`block: "nearest"` mira o scroll container horizontal sem
  // mexer no scroll vertical da página.
  useEffect(() => {
    ativaRef.current?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    // O layout muda de largura (tab ativa some/aparece), então reavalia o fade.
    atualizarFade();
  }, [pathname]);

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{ background: "var(--bg)", borderColor: "var(--border)", transform: "translateZ(0)" }}
    >
      <div className="relative">
        <div
          ref={containerRef}
          onScroll={atualizarFade}
          className="scrollbar-hide mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 sm:px-6"
        >
          {ABAS.map((aba) => {
            const ativa = pathname === aba.href || pathname.startsWith(`${aba.href}/`);
            const Icon = aba.icon;
            return (
              <Link
                key={aba.href}
                href={aba.href}
                ref={ativa ? ativaRef : undefined}
                className="flex shrink-0 items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors sm:px-4"
                style={{
                  color: ativa ? "var(--water-bright)" : "var(--text-muted)",
                  borderBottom: ativa ? "2px solid var(--water-bright)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                <Icon size={16} />
                {aba.label}
              </Link>
            );
          })}
          {/* Espaço de respiro depois do último item — garante que "Contatos"
              nunca fique colado na borda ao rolar até o fim. Depender só do
              padding do container é frágil em alguns navegadores WebKit. */}
          <div className="shrink-0" style={{ width: "1rem" }} aria-hidden />
        </div>

        {/* Fade indicando que há mais abas pra rolar — some quando não há
            overflow (desktop) ou quando já se rolou até o fim. */}
        {podeRolarDireita && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-6"
            style={{ background: "linear-gradient(to right, transparent, var(--bg))" }}
            aria-hidden
          />
        )}
      </div>
    </nav>
  );
}
