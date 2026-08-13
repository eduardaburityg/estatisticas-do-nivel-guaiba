"""
Grafo LangGraph que implementa o loop ReAct (Reasoning + Acting):

    entrada -> [agente] -> tem tool_calls? --sim--> [tools] --+
                  ^                                            |
                  |                                            |
                  +--------------------------------------------+
                  |
                 não
                  v
                 fim

O nó "agente" chama o LLM com as tools disponíveis (bind_tools). O modelo
decide sozinho, a cada turno, se responde direto ou se pede pra chamar uma
tool — quando pede, a resposta vem com `tool_calls` preenchido.

`tools_condition` (langgraph.prebuilt) olha a última mensagem do estado: se
ela tem `tool_calls`, roteia pro nó "tools"; senão, roteia pro fim do grafo
(END). O nó "tools" é um `ToolNode` pronto do LangGraph — ele executa a tool
de verdade (a função Python) e devolve o resultado como uma `ToolMessage`,
que entra no histórico de mensagens. Daí o grafo volta pro nó "agente", que
agora vê o resultado da tool e decide o próximo passo: responder pro usuário
ou chamar outra tool. Esse "voltar pro agente depois da tool" é o que fecha
o loop ReAct — o agente intercala raciocínio (decidir o que fazer) com ação
(rodar a tool) até achar que já pode responder.

O estado do grafo é um `MessagesState` — basicamente `{"messages": [...]}` —
e cada nó só precisa devolver as mensagens NOVAS que quer adicionar; o
LangGraph cuida de acumular no histórico.
"""

import os
import time

from langchain_openai import ChatOpenAI
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .tools import buscar_noticias_recentes, consultar_nivel_guaiba

TOOLS = [buscar_noticias_recentes, consultar_nivel_guaiba]

SYSTEM_PROMPT = (
    "Você é o assistente do painel Estatísticas do Nível do Guaíba. Ajuda "
    "moradores de Porto Alegre e do Rio Grande do Sul a entender o nível do "
    "rio, a previsão do tempo e alertas de enchente. Use a tool "
    "consultar_nivel_guaiba para dados atuais do Guaíba e dos rios "
    "afluentes, e buscar_noticias_recentes para notícias, previsão do tempo "
    "ou qualquer informação que você não tenha de cor. Se a pergunta "
    "envolver risco de vida ou uma emergência em andamento, oriente a "
    "pessoa a ligar 199 (Defesa Civil) imediatamente, além de responder à "
    "pergunta.\n\n"
    "Responda sempre em português do Brasil. Nunca misture palavras em "
    "inglês, mesmo em termos técnicos ou meteorológicos — diga \"pancadas "
    "de chuva\" em vez de \"showers\", por exemplo.\n\n"
    "Nunca use formatação Markdown na resposta: sem **negrito**, sem listas "
    "com hífen ou asterisco, sem headers com #. A resposta é exibida como "
    "texto puro no widget do chat, então Markdown aparece como caracteres "
    "literais e quebra a leitura. Para estruturar informação, como uma "
    "previsão por dia, use quebras de linha e frases curtas em vez de "
    "listas com marcadores.\n\n"
    "Mantenha um tom natural e direto, como se estivesse conversando, sem "
    "parecer um relatório."
)

# bind_tools() é o que dá ao modelo a lista de tools disponíveis e o schema
# de cada uma — sem isso ele nunca emitiria tool_calls. base_url aponta pro
# OpenRouter em vez da API da OpenAI direto; o resto da interface do
# ChatOpenAI (bind_tools, invoke, streaming) é igual. timeout/max_retries
# evitam que uma OpenRouter lenta ou instável deixe a requisição pendurada
# indefinidamente — sem isso, uma chamada travada nunca retorna erro nem
# sucesso, e o timeout do /chat em main.py não teria como interromper uma
# chamada de rede síncrona presa dentro do SDK.
_modelo = ChatOpenAI(
    model=os.environ["OPENROUTER_MODEL"],
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
    temperature=0,
    timeout=30,
    max_retries=1,
).bind_tools(TOOLS)


def chamar_agente(state: MessagesState) -> dict:
    """Nó "agente" do grafo: manda o histórico de mensagens (com o system
    prompt na frente) pro modelo e devolve a resposta como uma nova mensagem
    do estado. A resposta tanto pode ser texto final quanto uma decisão de
    chamar uma tool — o roteamento pra cada caso acontece fora daqui, no
    tools_condition. Um /chat pode passar por aqui mais de uma vez (turno
    inicial + turno depois de cada tool chamada), então cada passagem é
    cronometrada e logada separadamente — é o que permite achar qual chamada
    específica ao modelo ficou lenta."""
    mensagens = [("system", SYSTEM_PROMPT), *state["messages"]]

    inicio = time.perf_counter()
    try:
        resposta = _modelo.invoke(mensagens)
    finally:
        # finally garante o log mesmo quando a chamada estoura o timeout do
        # cliente ou erra — saber que uma chamada ficou perto do teto de 30s
        # antes de falhar é justamente o sinal de lentidão que queremos ver.
        duracao = time.perf_counter() - inicio
        print(f"[guaiba-agent] chamada ao modelo levou {duracao:.2f}s")

    return {"messages": [resposta]}


_grafo = StateGraph(MessagesState)
_grafo.add_node("agente", chamar_agente)
_grafo.add_node("tools", ToolNode(TOOLS))

_grafo.set_entry_point("agente")
_grafo.add_conditional_edges("agente", tools_condition, {"tools": "tools", END: END})
_grafo.add_edge("tools", "agente")

agent_graph = _grafo.compile()
