"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type Mensagem = { role: "user" | "assistant"; content: string };

const TEAL = "#0F6E56";
const TEAL_TEXT = "#E1F5EE";

export function ChatBubble() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [contadorNaoLidas, setContadorNaoLidas] = useState(0);
  const [pulando, setPulando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  // Refs espelhando o estado pra ler o valor atual dentro do callback
  // assíncrono do fetch (a closure de enviar() captura o estado de quando
  // foi disparada, não o estado no momento em que a resposta chega).
  const abertoRef = useRef(aberto);
  const contadorNaoLidasRef = useRef(contadorNaoLidas);

  useEffect(() => {
    abertoRef.current = aberto;
  }, [aberto]);

  useEffect(() => {
    contadorNaoLidasRef.current = contadorNaoLidas;
  }, [contadorNaoLidas]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, enviando]);

  function alternarChat() {
    if (!aberto) setContadorNaoLidas(0);
    setAberto((v) => !v);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = entrada.trim();
    if (!texto || enviando) return;

    const agentUrl = process.env.NEXT_PUBLIC_AGENT_API_URL;
    if (!agentUrl) {
      setErro("Assistente indisponível: NEXT_PUBLIC_AGENT_API_URL não configurado.");
      return;
    }

    const historico = mensagens;
    const novasMensagens: Mensagem[] = [...mensagens, { role: "user", content: texto }];
    setMensagens(novasMensagens);
    setEntrada("");
    setErro(null);
    setEnviando(true);

    try {
      const resposta = await fetch(`${agentUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texto, history: historico }),
      });

      if (!resposta.ok) throw new Error(`Agente respondeu ${resposta.status}`);

      const dados = await resposta.json();
      setMensagens([...novasMensagens, { role: "assistant", content: dados.reply }]);

      if (!abertoRef.current) {
        if (contadorNaoLidasRef.current === 0) {
          setPulando(true);
          window.setTimeout(() => setPulando(false), 700);
        }
        setContadorNaoLidas((c) => c + 1);
      }
    } catch {
      setErro("Não foi possível falar com o assistente agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {aberto && (
        <div
          className="fixed bottom-24 right-4 z-50 flex h-[420px] w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:right-6 sm:h-[480px] sm:w-[360px]"
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: TEAL, color: TEAL_TEXT }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <p className="text-sm font-semibold">Assistente Guaíba</p>
            </div>
            <button
              onClick={() => setAberto(false)}
              aria-label="Fechar chat"
              className="rounded-md p-1 transition-opacity hover:opacity-75"
              style={{ color: TEAL_TEXT }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white px-3 py-3">
            {mensagens.length === 0 && (
              <p className="text-sm text-gray-500">
                Pergunte sobre o nível do Guaíba, previsão do tempo ou notícias de enchente no RS.
              </p>
            )}

            <div className="flex flex-col gap-2">
              {mensagens.map((m, i) => (
                <div
                  key={i}
                  className="max-w-[85%] rounded-[10px] px-3 py-2 text-sm whitespace-pre-wrap text-gray-800"
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    background:
                      m.role === "user"
                        ? "#F1F2F4"
                        : "color-mix(in srgb, var(--water-bright) 22%, white)",
                  }}
                >
                  {m.content}
                </div>
              ))}

              {enviando && (
                <div className="flex items-center gap-1 self-start rounded-[10px] px-3 py-2.5" style={{ background: "#F1F2F4" }}>
                  <span className="chat-dot" style={{ background: TEAL }} />
                  <span className="chat-dot" style={{ background: TEAL, animationDelay: "0.15s" }} />
                  <span className="chat-dot" style={{ background: TEAL, animationDelay: "0.3s" }} />
                </div>
              )}
            </div>
            <div ref={fimRef} />
          </div>

          {erro && <p className="px-4 pb-1 text-xs text-red-600">{erro}</p>}

          <form onSubmit={enviar} className="flex gap-2 border-t border-gray-200 bg-white p-3">
            <input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Pergunte algo..."
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-300"
            />
            <button
              type="submit"
              disabled={enviando || !entrada.trim()}
              aria-label="Enviar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-opacity disabled:opacity-50"
              style={{ background: TEAL, color: TEAL_TEXT }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={alternarChat}
        aria-label={
          aberto
            ? "Fechar chat"
            : contadorNaoLidas > 0
              ? `Abrir chat do assistente — ${contadorNaoLidas} nova(s) mensagem(ns)`
              : "Abrir chat do assistente"
        }
        className={`fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-md transition-transform duration-200 hover:scale-105 sm:right-6 ${pulando ? "bubble-bounce" : ""}`}
        style={{ background: TEAL, color: TEAL_TEXT }}
      >
        {aberto ? <X size={22} /> : <MessageCircle size={22} />}
        {contadorNaoLidas > 0 && (
          <span
            className="badge-pulse absolute flex items-center justify-center rounded-full font-bold text-white"
            style={{
              top: "-4px",
              right: "-4px",
              width: 20,
              height: 20,
              fontSize: "11px",
              background: "#E24B4A",
              border: "2px solid var(--bg)",
            }}
          >
            {contadorNaoLidas > 9 ? "9+" : contadorNaoLidas}
          </span>
        )}
      </button>

      <style jsx>{`
        .badge-pulse {
          animation: badge-pulse 2s ease-in-out infinite;
        }
        @keyframes badge-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        .bubble-bounce {
          animation: bubble-bounce 0.6s ease;
        }
        @keyframes bubble-bounce {
          0%,
          100% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.18);
          }
          55% {
            transform: scale(0.94);
          }
          75% {
            transform: scale(1.05);
          }
        }
        .chat-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          animation: chat-blink 1.1s infinite ease-in-out both;
        }
        @keyframes chat-blink {
          0%,
          80%,
          100% {
            opacity: 0.25;
            transform: scale(0.85);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
