"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIAS = ["Doação (roupas, água, alimentos)", "Transporte/resgate de itens", "Abrigo temporário", "Outro"];

export function AjudaForm({ onEnviado }: { onEnviado?: () => void }) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [descricao, setDescricao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || !cidade.trim() || !telefone.trim()) {
      setErro("Preencha nome, cidade e WhatsApp/telefone de contato.");
      return;
    }

    setEnviando(true);
    const { error } = await supabase.from("solicitacoes_ajuda").insert({
      tipo: "pedido",
      nome: nome.trim(),
      cidade: cidade.trim(),
      bairro: bairro.trim() || null,
      categoria,
      descricao: descricao.trim() || null,
      telefone: telefone.trim(),
    });
    setEnviando(false);

    if (error) {
      setErro("Não foi possível enviar agora. Tente novamente em instantes.");
      return;
    }

    setSucesso(true);
    setNome("");
    setCidade("");
    setBairro("");
    setDescricao("");
    setTelefone("");
    onEnviado?.();
  }

  if (sucesso) {
    return (
      <div
        className="rounded-xl border p-5 text-sm"
        style={{ background: "var(--status-normal-dim)", borderColor: "var(--status-normal)", color: "var(--text)" }}
      >
        <p className="font-medium" style={{ color: "var(--status-normal)" }}>
          Recebido! Seu pedido entra em análise e aparece na lista pública assim que for aprovado.
        </p>
        <button
          onClick={() => setSucesso(false)}
          className="mt-3 text-xs underline"
          style={{ color: "var(--text-muted)" }}
        >
          Enviar outro
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="flex flex-col gap-3 rounded-xl border p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <h3 className="font-display text-base font-semibold">Pedir ajuda</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo label="Seu nome">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="campo-input"
            placeholder="Nome"
            required
          />
        </Campo>
        <Campo label="Cidade">
          <input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="campo-input"
            placeholder="Ex: Porto Alegre"
            required
          />
        </Campo>
        <Campo label="Bairro (opcional)">
          <input value={bairro} onChange={(e) => setBairro(e.target.value)} className="campo-input" />
        </Campo>
        <Campo label="Categoria">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="campo-input">
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo label="Descrição (opcional)">
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="campo-input"
          rows={3}
          placeholder="O que você precisa?"
        />
      </Campo>

      <Campo
        label={
          <>
            WhatsApp/telefone de contato <span style={{ color: "var(--status-critico)" }}>*</span>
          </>
        }
      >
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="campo-input"
          placeholder="(51) 9xxxx-xxxx"
          required
        />
      </Campo>

      {erro && (
        <p className="text-xs" style={{ color: "var(--status-critico)" }}>
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
        style={{ background: "var(--water)", color: "var(--bg-deep)" }}
      >
        {enviando ? "Enviando..." : "Enviar pedido"}
      </button>

      <style jsx>{`
        :global(.campo-input) {
          background: var(--surface-raised);
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 14px;
          color: var(--text);
          width: 100%;
        }
        :global(.campo-input:focus) {
          outline: 2px solid var(--water-bright);
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}

function Campo({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
      {label}
      {children}
    </label>
  );
}
