# estatisticas-nivel-guaiba

Painel em tempo real do nível do rio Guaíba, previsão do tempo, pontos de apoio e pedidos de ajuda em Porto Alegre/RS, feito no contexto das enchentes que atingem o estado, para ajudar quem precisa acompanhar a situação rapidamente e conectar quem precisa de ajuda com quem pode ajudar. Também tem um assistente de IA (chat flutuante) pra responder perguntas sobre o nível do rio e notícias relacionadas.

![status](https://img.shields.io/badge/status-em%20desenvolvimento-2E93C7)
![next.js](https://img.shields.io/badge/Next.js-16-black)
![typescript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![python](https://img.shields.io/badge/Python-FastAPI%20%2B%20LangGraph-3776AB)

## Prévia do painel

<p float="left">
  <img src="docs/foto1.png" width="45%" />
  <img src="docs/foto2.png" width="45%" />
</p>
<p float="left">
  <img src="docs/foto3.png" width="45%" />
  <img src="docs/foto4.png" width="45%" />
</p>

> As screenshots acima são de antes da reorganização em abas — a estrutura
> atual de navegação está descrita abaixo.

## Navegação

O dashboard é organizado em 4 abas (tab bar fixa abaixo do header, cada uma
com URL própria):

- **Painel** (`/painel`, aba inicial) — as duas réguas do Guaíba em Porto
  Alegre (Usina do Gasômetro e Cais Mauá C6, comparadas por % da cota, já
  que cada uma tem seu próprio "zero" de referência), histórico recente,
  clima e o card de pontos de apoio.
- **Rios** (`/rios`) — nível dos rios afluentes da bacia (Jacuí, Sinos, Caí,
  Gravataí e Taquari) que deságuam no Guaíba direto ou via Delta do Jacuí.
- **Rede de apoio** (`/rede-de-apoio`) — busca de pedidos de ajuda por
  cidade (busca-primeiro: só mostra pedidos depois que uma cidade é
  buscada) e formulário para cadastrar um novo pedido.
- **Contatos** (`/contatos`) — contatos de emergência (Defesa Civil,
  Bombeiros, Brigada Militar) com números clicáveis.

Em todas as abas há uma bolha de chat fixa no canto inferior direito
(assistente de IA — ver seção abaixo).

## Assistente de IA (`guaiba-agent/`)

Um microserviço Python separado, em `guaiba-agent/`, expõe um agente
conversacional que o `ChatBubble` do dashboard chama via HTTP:

- **FastAPI** expõe `POST /chat`.
- **LangGraph** implementa o agente como um loop ReAct (`agent/graph.py`):
  o modelo decide, a cada turno, se responde direto ou chama uma tool.
- Duas tools (`agent/tools.py`): `consultar_nivel_guaiba` (consulta o
  `/api/guaiba` deste mesmo dashboard) e `buscar_noticias_recentes` (busca
  na web via Tavily).
- O modelo é servido via **OpenRouter** (não Anthropic/OpenAI direto) —
  configurável por env var, com um modelo gratuito como default.

É um processo separado do Next.js — **precisa estar rodando** para o chat
funcionar (o resto do dashboard funciona normalmente sem ele). Detalhes de
setup, deploy e as ressalvas do tier gratuito da OpenRouter estão no
[`guaiba-agent/README.md`](guaiba-agent/README.md).

## Stack

- **Next.js 16** (App Router) + **TypeScript** — front-end e API routes no
  mesmo projeto, deploy direto na Vercel.
- **Tailwind CSS v4** para estilo, com um sistema de tokens de design
  próprio (`src/app/globals.css`) em vez do tema padrão.
- **Recharts** para o gráfico de histórico.
- **fast-xml-parser** para ler a resposta XML do serviço da ANA.
- **Supabase (PostgreSQL)** para persistência dos pedidos de ajuda.
- **Python + FastAPI + LangGraph + OpenRouter + Tavily** para o agente de
  IA — ver `guaiba-agent/README.md` para detalhes.

## Fontes de dados

| Dado | Fonte | Autenticação |
|---|---|---|
| Nível do rio (Porto Alegre) | [ANA — Hidrotelemetria](https://www.ana.gov.br/hidrowebservico) — Usina do Gasômetro (`87450020`) e Cais Mauá C6 (`87450004`) | Nenhuma (serviço público) |
| Nível dos rios afluentes | ANA — Hidrotelemetria (Jacuí, Sinos, Caí, Gravataí, Taquari) | Nenhuma |
| Clima | [Open-Meteo](https://open-meteo.com/) | Nenhuma |
| Contatos de emergência | `src/data/contatos-emergencia.json` | — |
| Pontos de apoio (abrigos) | Canal oficial da Defesa Civil ([prefeitura.poa.br/defesa-civil](https://prefeitura.poa.br/defesa-civil)) — não mantido pelo painel | — |
| Pedidos de ajuda | Supabase (tabela `solicitacoes_ajuda`) | Chave anon (ver `.env.local`) |
| Respostas do assistente de IA | OpenRouter (modelo configurável) + Tavily (busca na web) | Chaves próprias em `guaiba-agent/.env` |

## API (Next.js)

### `GET /api/guaiba`
Retorna `{ portoAlegre: [...], afluentes: [...] }` com o nível atual de
todas as estações monitoradas. Usado pela aba Painel/Rios e também
consumido pelo `guaiba-agent` (tool `consultar_nivel_guaiba`).

### `GET /api/clima`
Retorna a previsão do tempo (Open-Meteo) para Porto Alegre.

### `PUT /api/solicitacoes/[id]`
Atualiza um pedido de ajuda existente (ex: aprovar um pedido — os pedidos
só aparecem na busca pública depois de `status = "aprovado"`).

> Não há mais `GET`/`POST /api/solicitacoes` — o formulário "Pedir ajuda" e
> a busca por cidade falam direto com o Supabase pelo cliente
> (`src/lib/supabase.ts`), sem passar por uma API route própria.

## Variáveis de ambiente

Crie um `.env.local` na raiz com:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_public
NEXT_PUBLIC_AGENT_API_URL=http://localhost:8000
```
`NEXT_PUBLIC_AGENT_API_URL` é o endereço do `guaiba-agent` (ver seção
seguinte) — sem essa variável, o `ChatBubble` mostra um erro amigável em
vez de travar.

## Rodando localmente

O projeto tem **dois processos** — o chat só funciona com os dois rodando
ao mesmo tempo, mas o resto do dashboard funciona normalmente só com o
primeiro.

**1. Dashboard Next.js**
```bash
npm install
npm run dev
```
Abre em [http://localhost:3000](http://localhost:3000) (redireciona pra
`/painel`).

**2. Agente de IA (`guaiba-agent/`)**
```bash
cd guaiba-agent
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edite .env e preencha OPENROUTER_API_KEY, TAVILY_API_KEY e GUAIBA_DATA_API_URL

uvicorn main:app --reload
```
Sobe em [http://localhost:8000](http://localhost:8000). Detalhes completos
(deploy, limites do tier gratuito da OpenRouter, troubleshooting) no
[`guaiba-agent/README.md`](guaiba-agent/README.md).

## Testes

No momento não há testes automatizados no projeto — a suíte anterior
(`vitest`) cobria só a antiga rota `POST /api/solicitacoes`, removida
quando esse fluxo passou a falar direto com o Supabase. `npm test` roda o
`vitest`, mas não há nenhum arquivo `*.test.ts` no repositório hoje.

## Nota técnica

**Por que Supabase:** já uso essa stack no dia a dia, e resolve persistência
+ API instantânea sem precisar subir e manter um banco à parte — bom
equilíbrio entre velocidade de desenvolvimento e robustez para um projeto
que ainda está validando seu formato final.

**Trade-off consciente — RLS aberta:** as policies de Row Level Security da
tabela `solicitacoes_ajuda` liberam select/insert/update para o role `anon`,
sem autenticação. Essa é uma decisão temporária para a fase atual do
projeto — antes de qualquer divulgação pública real, isso precisa mudar
para exigir autenticação na criação/edição de pedidos e restringir updates
de status a voluntários verificados.

**Melhorias planejadas:**
- Autenticação (ex: Supabase Auth) para diferenciar quem pede ajuda de quem
  modera/aprova pedidos.
- Mapa (Leaflet/Mapbox) para visualizar pedidos e pontos de apoio
  geograficamente, não só em lista.
- Migrar `abrigos.json` para o Supabase também, para atualização sem
  redeploy.
- Rate limiting no endpoint de criação de pedidos para evitar spam/abuso.
- Melhorar design/conteúdo da aba Rede de apoio (marcado como TODO no
  código) — o fluxo de busca-por-cidade já está pronto, falta uma passada
  visual mais dedicada.

## Limitações conhecidas

1. **Cotas de atenção são estimativas.** As cotas de INUNDAÇÃO usadas em
   `src/lib/estacoes.ts` estão confirmadas (fontes citadas nos comentários
   do arquivo); as cotas de ATENÇÃO ainda são uma estimativa (≈85% da cota
   de inundação) até serem confirmadas com a Defesa Civil de cada
   município — não divulgar como valor oficial sem essa confirmação.

2. **Integração com a ANA testada localmente, não confirmada em
   produção.** O fetch em `src/lib/ana.ts` já retorna dados reais (não modo
   demonstração) neste ambiente de desenvolvimento, mas ainda não foi
   confirmado especificamente no ambiente de produção (Vercel) — a rede lá
   pode se comportar diferente. Se cair em modo demonstração em produção, o
   campo `fonte` do retorno da API indica isso.

## Roadmap

- [ ] Confirmar as cotas de atenção com a Defesa Civil de cada município
- [ ] Validar a integração com a ANA no ambiente de produção (Vercel)
- [ ] Mapa (Leaflet/Mapbox) para pedidos de ajuda e pontos de apoio
- [ ] Autenticação para moderação de pedidos
- [ ] Alertas por bairro usando os dados abertos da Prefeitura de POA
      ([dadosabertos.poa.br](https://dadosabertos.poa.br))
- [ ] Redesign da aba Rede de apoio (fluxo já reestruturado, falta a
      passada visual)
- [ ] Deploy do `guaiba-agent` (hoje só documentado para Render/Railway,
      ainda não publicado)

## Por que este projeto

Feito num momento em que o Rio Grande do Sul segue lidando com o risco de enchentes recorrentes. A ideia não é substituir os canais oficiais da Defesa Civil, mas oferecer uma visão rápida e acessível de dados que já são públicos, e conectar quem precisa de ajuda com quem pode ajudar.
