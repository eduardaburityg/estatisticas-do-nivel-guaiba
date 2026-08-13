import asyncio
import os
import sys
import traceback
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import AIMessage, HumanMessage
from pydantic import BaseModel

from agent.graph import agent_graph

app = FastAPI(title="Guaíba Agent")

allowed_origin = os.environ.get("ALLOWED_ORIGIN", "*")
if allowed_origin == "*":
    print(
        "[guaiba-agent] ALLOWED_ORIGIN não configurado — liberando CORS pra "
        "qualquer origem. Configure em produção (veja .env.example)."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class MensagemHistorico(BaseModel):
    role: str  # "user" ou "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[MensagemHistorico]] = None


class ChatResponse(BaseModel):
    reply: str


@app.get("/")
def health() -> dict:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    historico = []
    for item in req.history or []:
        classe = HumanMessage if item.role == "user" else AIMessage
        historico.append(classe(content=item.content))
    historico.append(HumanMessage(content=req.message))

    try:
        # agent_graph.invoke é síncrono/bloqueante — roda numa thread à
        # parte (asyncio.to_thread) pra que o wait_for consiga de fato
        # abandonar a espera no prazo, em vez de travar o event loop.
        resultado = await asyncio.wait_for(
            asyncio.to_thread(agent_graph.invoke, {"messages": historico}),
            timeout=40,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504, detail="O agente demorou demais pra responder, tenta de novo"
        )
    except Exception as erro:
        # Loga o traceback completo ANTES de levantar o 502 — sem isso, a
        # exceção original só sobrevive como a string curta em `detail`, e o
        # terminal nunca mostra onde/por que ela aconteceu de verdade.
        # Ambas as linhas vão pro stderr (mesmo stream do traceback) —
        # senão a ordem entre elas fica embaralhada quando o log é
        # redirecionado pra arquivo, já que stdout/stderr bufferizam diferente.
        print(f"[guaiba-agent] erro no /chat — mensagem do usuário: {req.message!r}", file=sys.stderr)
        traceback.print_exc()

        # Sem o raise abaixo, uma exceção não tratada escapa pro
        # ServerErrorMiddleware do Starlette, que devolve a resposta SEM os
        # headers de CORS — o navegador então mostra um erro de CORS opaco
        # em vez do 502 real.
        raise HTTPException(status_code=502, detail=f"Erro no agente: {erro}")

    ultima_mensagem = resultado["messages"][-1]
    return ChatResponse(reply=ultima_mensagem.content)
