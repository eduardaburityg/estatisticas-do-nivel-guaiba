import { XMLParser } from "fast-xml-parser";
import type { LeituraNivel, NivelEstacao, StatusRio } from "./types";
import { ESTACAO_GUAIBA, ESTACOES_AFLUENTES, ESTACOES_PORTO_ALEGRE, type ConfigEstacao } from "./estacoes";

const ANA_ENDPOINT =
  "http://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos";

function classificarStatus(nivel: number, cotaAtencao: number, cotaInundacao: number): StatusRio {
  if (nivel >= cotaInundacao) return "critico";
  if (nivel >= cotaAtencao) return "alerta";
  return "normal";
}

function calcularTendencia(historico: LeituraNivel[]) {
  if (historico.length < 2) {
    return { tendencia: "estavel" as const, variacaoCmPorHora: 0 };
  }

  const ultimaMs = new Date(historico[historico.length - 1].dataHora).getTime();
  const JANELA_MS = 3 * 60 * 60 * 1000;

  const pontosJanela = historico.filter((p) => ultimaMs - new Date(p.dataHora).getTime() <= JANELA_MS);
  const pontos = pontosJanela.length >= 3 ? pontosJanela : historico;

  const t0 = new Date(pontos[0].dataHora).getTime();
  const xs = pontos.map((p) => (new Date(p.dataHora).getTime() - t0) / 3_600_000);
  const ys = pontos.map((p) => p.nivelMetros);

  const n = pontos.length;
  const somaX = xs.reduce((s, x) => s + x, 0);
  const somaY = ys.reduce((s, y) => s + y, 0);
  const somaXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const somaXX = xs.reduce((s, x) => s + x * x, 0);

  const denominador = n * somaXX - somaX * somaX;
  const inclinacaoMetrosPorHora = denominador !== 0 ? (n * somaXY - somaX * somaY) / denominador : 0;
  const variacaoCmPorHora = inclinacaoMetrosPorHora * 100;

  if (Math.abs(variacaoCmPorHora) < 0.3) {
    return { tendencia: "estavel" as const, variacaoCmPorHora };
  }
  return {
    tendencia: variacaoCmPorHora > 0 ? ("subindo" as const) : ("descendo" as const),
    variacaoCmPorHora,
  };
}

function gerarSerieDemonstracao(nivelBase: number): LeituraNivel[] {
  const agora = Date.now();
  const pontos: LeituraNivel[] = [];
  let nivel = nivelBase;
  for (let i = 47; i >= 0; i--) {
    nivel += Math.sin(i / 6) * (nivelBase * 0.01) + (Math.random() - 0.5) * (nivelBase * 0.01);
    pontos.push({
      dataHora: new Date(agora - i * 30 * 60 * 1000).toISOString(),
      nivelMetros: Math.max(0.1, Number(nivel.toFixed(2))),
    });
  }
  return pontos;
}

function encontrarChave(obj: unknown, chave: string): unknown {
  if (obj === null || typeof obj !== "object") return undefined;
  const registro = obj as Record<string, unknown>;
  if (chave in registro) return registro[chave];
  for (const valor of Object.values(registro)) {
    const achado = encontrarChave(valor, chave);
    if (achado !== undefined) return achado;
  }
  return undefined;
}

function parseRespostaAna(xml: string): LeituraNivel[] {
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  const doc = parser.parse(xml);

  const linhas =
    encontrarChave(doc, "DadosHidrometereologicos") ??
    encontrarChave(doc, "DadosHidrometeorologicos");

  const lista = Array.isArray(linhas) ? linhas : linhas ? [linhas] : [];

  const leituras: LeituraNivel[] = [];
  for (const linha of lista as Record<string, unknown>[]) {
    const dataHoraTexto = String(linha?.DataHora ?? "").trim();
    const nivelTexto = linha?.Nivel;

    if (!dataHoraTexto || nivelTexto === undefined || nivelTexto === "") continue;

    const nivelCm = Number(nivelTexto);
    if (Number.isNaN(nivelCm)) continue;

    leituras.push({
      dataHora: new Date(dataHoraTexto.replace(" ", "T")).toISOString(),
      nivelMetros: nivelCm / 100,
    });
  }

  leituras.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
  return leituras;
}

export async function buscarNivelEstacao(
  config: ConfigEstacao,
  opcoes: { permitirDemonstracao: boolean } = { permitirDemonstracao: true }
): Promise<NivelEstacao | null> {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - 2);

    const formatarData = (d: Date) =>
      d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    const params = new URLSearchParams({
      codEstacao: config.codigo,
      dataInicio: formatarData(inicio),
      dataFim: formatarData(hoje),
    });

    const resposta = await fetch(`${ANA_ENDPOINT}?${params.toString()}`, {
      next: { revalidate: 600 },
    });

    if (!resposta.ok) throw new Error(`ANA respondeu ${resposta.status}`);

    const xml = await resposta.text();
    const historico = parseRespostaAna(xml);

    if (historico.length === 0) throw new Error("Sem leituras no XML da ANA");

    const atual = historico[historico.length - 1];
    const { tendencia, variacaoCmPorHora } = calcularTendencia(historico);

    return {
      estacaoCodigo: config.codigo,
      estacaoNome: config.nome,
      rio: config.rio,
      municipio: config.municipio,
      relacaoComGuaiba: config.relacaoComGuaiba,
      contribuicaoPercentual: config.contribuicaoPercentual,
      nivelAtualMetros: atual.nivelMetros,
      cotaInundacaoMetros: config.cotaInundacaoMetros,
      cotaAtencaoMetros: config.cotaAtencaoMetros,
      status: classificarStatus(atual.nivelMetros, config.cotaAtencaoMetros, config.cotaInundacaoMetros),
      tendencia,
      variacaoCmPorHora,
      atualizadoEm: atual.dataHora,
      historico,
      fonte: "ANA — Rede Hidrometeorológica Nacional (Hidrotelemetria)",
      modoDemonstracao: false,
    };
  } catch {
    if (!opcoes.permitirDemonstracao) return null;

    const nivelBase = config.cotaAtencaoMetros * 0.6;
    const historico = gerarSerieDemonstracao(nivelBase);
    const atual = historico[historico.length - 1];
    const { tendencia, variacaoCmPorHora } = calcularTendencia(historico);

    return {
      estacaoCodigo: config.codigo,
      estacaoNome: config.nome,
      rio: config.rio,
      municipio: config.municipio,
      relacaoComGuaiba: config.relacaoComGuaiba,
      contribuicaoPercentual: config.contribuicaoPercentual,
      nivelAtualMetros: atual.nivelMetros,
      cotaInundacaoMetros: config.cotaInundacaoMetros,
      cotaAtencaoMetros: config.cotaAtencaoMetros,
      status: classificarStatus(atual.nivelMetros, config.cotaAtencaoMetros, config.cotaInundacaoMetros),
      tendencia,
      variacaoCmPorHora,
      atualizadoEm: atual.dataHora,
      historico,
      fonte: "Modo demonstração (serviço ANA indisponível no momento)",
      modoDemonstracao: true,
    };
  }
}

export async function buscarNivelGuaiba(): Promise<NivelEstacao> {
  const resultado = await buscarNivelEstacao(ESTACAO_GUAIBA, { permitirDemonstracao: true });
  return resultado as NivelEstacao;
}

export async function buscarNiveisPortoAlegre(): Promise<NivelEstacao[]> {
  const resultados = await Promise.all(
    ESTACOES_PORTO_ALEGRE.map((config) => buscarNivelEstacao(config, { permitirDemonstracao: true }))
  );
  return resultados.filter((r): r is NivelEstacao => r !== null);
}

export async function buscarNiveisAfluentes(): Promise<NivelEstacao[]> {
  const resultados = await Promise.all(
    ESTACOES_AFLUENTES.map((config) => buscarNivelEstacao(config, { permitirDemonstracao: false }))
  );
  return resultados.filter((r): r is NivelEstacao => r !== null);
}
