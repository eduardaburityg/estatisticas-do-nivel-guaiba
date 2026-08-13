# Guaíba Agent

Microserviço em Python (FastAPI + LangGraph) que expõe um agente de IA
conversacional sobre o nível do Guaíba, rios afluentes e notícias
relacionadas a enchentes no RS. Roda separado do dashboard Next.js e
conversa com ele via HTTP.

- `POST /chat` — recebe `{ "message": string, "history"?: [{role, content}] }`
  e devolve `{ "reply": string }`.
- O agente usa duas tools: `consultar_nivel_guaiba` (consulta o endpoint
  `/api/guaiba` do dashboard) e `buscar_noticias_recentes` (busca na web via
  Tavily).

## Rodando localmente

Requer **Python 3.10+** (o grafo usa sintaxe de tipos moderna do LangGraph).

```bash
cd guaiba-agent
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edite .env e preencha OPENROUTER_API_KEY, TAVILY_API_KEY e GUAIBA_DATA_API_URL

uvicorn main:app --reload
```

O modelo padrão (`OPENROUTER_MODEL=qwen/qwen3-coder:free`) é gratuito na
OpenRouter. Duas ressalvas de quem usa o tier free:

- **Limite de 50 requisições/dia** por chave de API (compartilhado entre
  todos os modelos `:free` que você chamar). Pra mais volume, é preciso
  adicionar créditos na conta OpenRouter ou trocar pra um modelo pago.
- **O modelo `:free` pode rotacionar** — a OpenRouter troca ou descontinua
  variantes gratuitas sem aviso prévio. Se o agente parar de responder ou
  passar a dar erro, confira a lista atual em
  [openrouter.ai/models](https://openrouter.ai/models?max_price=0) e ajuste
  `OPENROUTER_MODEL`.

O serviço sobe em `http://localhost:8000`. Teste com:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual o nível do Guaíba agora?"}'
```

`GUAIBA_DATA_API_URL` deve apontar pro endpoint `/api/guaiba` do dashboard
Next.js rodando (`npm run dev` nele expõe em `http://localhost:3000/api/guaiba`).

## Deploy (Render ou Railway, free tier)

Ambos seguem o mesmo padrão: conectar o repositório, apontar pra pasta
`guaiba-agent/` como raiz do serviço, e configurar:

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Variáveis de ambiente:** as mesmas do `.env.example` — `OPENROUTER_API_KEY`,
  `OPENROUTER_MODEL`, `TAVILY_API_KEY`, `GUAIBA_DATA_API_URL` (aqui deve
  apontar pro domínio publicado do dashboard, não `localhost`),
  `ALLOWED_ORIGIN` (o domínio publicado do frontend).

**Render:** New → Web Service → selecione o repo → Root Directory
`guaiba-agent` → preencha build/start command acima → adicione as env vars
em Environment.

**Railway:** New Project → Deploy from GitHub repo → em Settings, defina o
Root Directory como `guaiba-agent` → o start command acima em Settings →
Deploy → adicione as env vars em Variables.

Depois do deploy, atualize `NEXT_PUBLIC_AGENT_API_URL` no `.env.local` do
dashboard Next.js para a URL pública do serviço (ex:
`https://guaiba-agent.onrender.com`).
