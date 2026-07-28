'use client';

import { useState, useEffect, FormEvent, CSSProperties } from 'react';

type Solicitacao = {
  id: string;
  nome: string;
  cidade: string;
  bairro: string | null;
  tipo_ajuda: string;
  descricao: string | null;
  telefone: string | null;
  status: string;
};

const TIPOS_AJUDA = [
  'Reparo no telhado',
  'Retirada de móveis',
  'Limpeza pós-enchente',
  'Doação de alimentos',
  'Doação de roupas',
  'Transporte',
  'Outro',
];

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: '0.75rem',
  borderWidth: '1px',
  borderStyle: 'solid',
  background: 'var(--surface)',
  color: 'var(--text)',
  padding: '0.65rem 0.9rem',
  fontSize: '0.875rem',
  outline: 'none',
};

export default function SolicitacoesAjuda() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [tipoAjuda, setTipoAjuda] = useState(TIPOS_AJUDA[0]);
  const [descricao, setDescricao] = useState('');
  const [telefone, setTelefone] = useState('');

  async function carregar() {
    setLoading(true);
    const res = await fetch('/api/solicitacoes');
    const data = await res.json();
    setSolicitacoes(data);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (!nome || !cidade || !tipoAjuda) {
      setErro('Preencha nome, cidade e tipo de ajuda.');
      return;
    }

    setEnviando(true);
    const res = await fetch('/api/solicitacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cidade, bairro, tipo_ajuda: tipoAjuda, descricao, telefone }),
    });

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error ?? 'Erro ao enviar solicitação.');
      setEnviando(false);
      return;
    }

    setNome('');
    setCidade('');
    setBairro('');
    setDescricao('');
    setTelefone('');
    setTipoAjuda(TIPOS_AJUDA[0]);
    setSucesso(true);
    setEnviando(false);
    carregar();
  }

  return (
    <section
      className="mt-12 rounded-2xl border p-6"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div>
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Pedidos de ajuda
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Pessoas que precisam de apoio na sua região. Se puder ajudar, entre em contato.
        </p>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        ) : solicitacoes.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum pedido registrado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {solicitacoes.map((s) => (
              <li
                key={s.id}
                className="rounded-xl p-4"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{s.nome}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {s.cidade}
                      {s.bairro ? ` — ${s.bairro}` : ''}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                    style={{ background: 'var(--border)', color: 'var(--text)' }}
                  >
                    {s.tipo_ajuda}
                  </span>
                </div>
                {s.descricao && (
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{s.descricao}</p>
                )}
                {s.telefone && (
                  <a
                    href={`tel:${s.telefone}`}
                    className="text-sm mt-2 inline-block"
                    style={{ color: '#4da3ff' }}
                  >
                    📞 {s.telefone}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Precisa de ajuda?
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Cadastre seu pedido pra que voluntários da sua região possam te encontrar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
          <input
            className="form-field"
            style={inputStyle}
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className="form-field"
            style={inputStyle}
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
          <input
            className="form-field"
            style={inputStyle}
            placeholder="Bairro (opcional)"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />
          <select
            className="form-field"
            style={inputStyle}
            value={tipoAjuda}
            onChange={(e) => setTipoAjuda(e.target.value)}
          >
            {TIPOS_AJUDA.map((t) => (
              <option key={t} value={t} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                {t}
              </option>
            ))}
          </select>
          <textarea
            className="form-field"
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Descreva o que você precisa (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <input
            className="form-field"
            style={inputStyle}
            placeholder="Telefone de contato (opcional)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          {erro && <p className="text-sm" style={{ color: '#ff6b6b' }}>{erro}</p>}
          {sucesso && <p className="text-sm" style={{ color: '#4ade80' }}>Pedido cadastrado com sucesso!</p>}

          <button
            type="submit"
            disabled={enviando}
            className="btn-primary rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--text)', color: 'var(--surface)' }}
          >
            {enviando ? 'Enviando...' : 'Cadastrar pedido'}
          </button>
        </form>
      </div>
    </section>
  );
}
