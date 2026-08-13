import os

import httpx
from langchain_core.tools import tool
from tavily import TavilyClient


@tool
def buscar_noticias_recentes(consulta: str) -> str:
    """Busca notícias e informações atuais na web (previsão do tempo, alertas de
    enchente, nível de rios etc.). Use para perguntas sobre eventos recentes
    que você não sabe de cor."""
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return "Busca na web indisponível: TAVILY_API_KEY não configurada no agente."

    try:
        client = TavilyClient(api_key=api_key)
        resultado = client.search(
            query=consulta, search_depth="basic", include_answer=True, max_results=5
        )
    except Exception as erro:
        return f"Não foi possível buscar agora: {erro}"

    resposta = resultado.get("answer") or "Sem resumo direto disponível."
    fontes = resultado.get("results", [])
    linhas_fontes = [f"- {f.get('title', 'sem título')}: {f.get('url', '')}" for f in fontes[:5]]

    if not linhas_fontes:
        return resposta
    return "\n".join([resposta, "", "Fontes:", *linhas_fontes])


def _formatar_estacao(estacao: dict) -> str:
    return (
        f"- {estacao.get('estacaoNome', '?')} ({estacao.get('rio', '?')}, "
        f"{estacao.get('municipio', '?')}): {estacao.get('nivelAtualMetros', '?')} m, "
        f"status {estacao.get('status', '?')}, tendência {estacao.get('tendencia', '?')}"
    )


@tool
def consultar_nivel_guaiba() -> str:
    """Consulta o nível atual do Guaíba (réguas de Porto Alegre) e dos rios
    afluentes da bacia. Use quando o usuário perguntar sobre nível do rio,
    risco de enchente ou situação atual da água."""
    url = os.environ.get("GUAIBA_DATA_API_URL")
    if not url:
        return "Consulta de nível indisponível: GUAIBA_DATA_API_URL não configurada no agente."

    try:
        resposta = httpx.get(url, timeout=10)
        resposta.raise_for_status()
        dados = resposta.json()
    except Exception as erro:
        return f"Não foi possível consultar o nível do Guaíba agora: {erro}"

    porto_alegre = dados.get("portoAlegre", [])
    afluentes = dados.get("afluentes", [])

    linhas = ["Réguas de Porto Alegre:"]
    linhas += [_formatar_estacao(e) for e in porto_alegre] or ["  (sem dados)"]
    linhas.append("")
    linhas.append("Rios afluentes da bacia:")
    linhas += [_formatar_estacao(e) for e in afluentes] or ["  (sem dados)"]

    return "\n".join(linhas)


if __name__ == "__main__":
    # ponytail: menor checagem executável — confirma que os guards devolvem
    # texto amigável em vez de estourar exceção quando as envs não estão
    # configuradas (é o caminho que roda em qualquer ambiente, sem chaves).
    os.environ.pop("TAVILY_API_KEY", None)
    os.environ.pop("GUAIBA_DATA_API_URL", None)
    assert "TAVILY_API_KEY" in buscar_noticias_recentes.invoke({"consulta": "teste"})
    assert "GUAIBA_DATA_API_URL" in consultar_nivel_guaiba.invoke({})
    print("ok: guards de tools.py funcionam sem crash")
