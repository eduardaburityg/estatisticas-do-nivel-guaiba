"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SolicitacaoAjuda } from "@/lib/types";

const DATALIST_ID = "cidades-com-pedidos";

export function AjudaList({ refreshKey }: { refreshKey?: number }) {
  const [cidadesSugeridas, setCidadesSugeridas] = useState<string[]>([]);
  const [cidadeInput, setCidadeInput] = useState("");
  const [cidadeBuscada, setCidadeBuscada] = useState("");
  const [itens, setItens] = useState<SolicitacaoAjuda[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(false);

  // Sugestões do datalist: cidades que de fato têm pedido aprovado — busca
  // todas as linhas e deduplica no cliente (volume baixo o suficiente pra
  // não precisar de uma query DISTINCT no banco). Isso é só uma sugestão;
  // a busca abaixo aceita qualquer cidade digitada, não só essas.
  useEffect(() => {
    let cancelado = false;

    async function buscarCidadesSugeridas() {
      const { data } = await supabase
        .from("solicitacoes_ajuda")
        .select("cidade")
        .eq("tipo", "pedido")
        .eq("status", "aprovado");

      if (!cancelado) {
        const unicas = Array.from(new Set((data ?? []).map((linha) => linha.cidade as string))).sort(
          (a, b) => a.localeCompare(b, "pt-BR")
        );
        setCidadesSugeridas(unicas);
      }
    }

    buscarCidadesSugeridas();
    return () => {
      cancelado = true;
    };
  }, [refreshKey]);

  // Debounce: só considera a busca "efetivada" 400ms depois que a pessoa
  // para de digitar — evita disparar uma query a cada tecla e a tela
  // piscando "nenhum resultado" pra cada letra digitada no meio do nome
  // da cidade. setCidadeBuscada só é chamado dentro do timeout (nunca
  // sincronamente no corpo do efeito).
  useEffect(() => {
    const texto = cidadeInput.trim();
    const timer = setTimeout(() => setCidadeBuscada(texto), 400);
    return () => clearTimeout(timer);
  }, [cidadeInput]);

  // Só busca (e só mostra) pedidos depois que uma cidade específica foi
  // buscada — sem cidade, o efeito não faz nada e a renderização abaixo já
  // garante que `itens` não aparece.
  useEffect(() => {
    if (!cidadeBuscada) return;

    let cancelado = false;

    async function buscarPedidos() {
      setCarregandoPedidos(true);
      const { data } = await supabase
        .from("solicitacoes_ajuda")
        .select("*")
        .eq("tipo", "pedido")
        .eq("status", "aprovado")
        .ilike("cidade", `%${cidadeBuscada}%`)
        .order("created_at", { ascending: false });

      if (!cancelado) {
        setItens((data as SolicitacaoAjuda[]) ?? []);
        setCarregandoPedidos(false);
      }
    }

    buscarPedidos();
    return () => {
      cancelado = true;
    };
  }, [cidadeBuscada, refreshKey]);

  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <label className="flex flex-col gap-1.5 text-sm font-medium" style={{ color: "var(--text)" }}>
        Buscar pedidos de ajuda por cidade
        <input
          value={cidadeInput}
          onChange={(e) => setCidadeInput(e.target.value)}
          list={DATALIST_ID}
          placeholder="Digite uma cidade — Ex: Porto Alegre"
          className="campo-select"
        />
        <datalist id={DATALIST_ID}>
          {cidadesSugeridas.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <div className="mt-4 flex flex-col gap-3">
        {!cidadeBuscada && (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Digite uma cidade acima pra ver os pedidos de ajuda cadastrados.
          </p>
        )}

        {cidadeBuscada && carregandoPedidos && (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Carregando...
          </p>
        )}

        {cidadeBuscada && !carregandoPedidos && itens.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Nenhum pedido de ajuda em {cidadeBuscada} no momento.
          </p>
        )}

        {cidadeBuscada &&
          itens.map((item) => (
            <div key={item.id} className="rounded-xl p-4" style={{ background: "var(--surface-raised)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: "var(--water-deep)", color: "var(--water-bright)" }}
                >
                  {item.categoria}
                </span>
                <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                  {item.cidade}
                  {item.bairro ? ` · ${item.bairro}` : ""}
                </span>
              </div>

              <p className="mt-2 text-sm font-medium">{item.nome}</p>
              {item.descricao && (
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  {item.descricao}
                </p>
              )}

              {item.telefone && (
                <a
                  href={`https://wa.me/55${item.telefone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium underline"
                  style={{ color: "var(--status-normal)" }}
                >
                  Chamar no WhatsApp
                </a>
              )}
            </div>
          ))}
      </div>

      <style jsx>{`
        .campo-select {
          margin-top: 0.125rem;
          background: var(--surface-raised);
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
          width: 100%;
        }
        .campo-select:focus {
          outline: 2px solid var(--water-bright);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}
