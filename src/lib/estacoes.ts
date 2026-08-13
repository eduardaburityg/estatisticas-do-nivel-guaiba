export interface ConfigEstacao {
  codigo: string;
  nome: string; // nome de exibição (cidade/local da estação)
  rio: string;
  municipio: string;
  cotaAtencaoMetros: number;
  cotaInundacaoMetros: number;
  /** Se o rio desemboca direto no Guaíba ou chega indiretamente via Delta do Jacuí. */
  relacaoComGuaiba: "direto" | "via-delta-jacui";
  /** % do volume de água do Guaíba que vem desse rio, quando conhecido. */
  contribuicaoPercentual?: number;
}

/**
 * Códigos de estação verificados cruzando o portal público da ANA
 * (telemetriaws1.ana.gov.br) com referências de terceiros que também usam
 * a mesma base (SGB/CPRM + ANA). As cotas de INUNDAÇÃO estão confirmadas;
 * as cotas de ATENÇÃO abaixo são uma ESTIMATIVA (≈85% da cota de
 * inundação) até serem confirmadas com a Defesa Civil de cada município —
 * ver README antes de divulgar publicamente.
 *
 * Porto Alegre tem duas réguas no Guaíba, cada uma com seu próprio "zero"
 * de referência — por isso não são comparáveis em metros, só em % da cota
 * (ver NotaDuasReguas.tsx). A estação 87450020 é a Usina do Gasômetro, não
 * o Cais Mauá (código 87450004) — rótulo corrigido após checagem cruzada
 * com o nivelguaiba.com.br.
 *
 * Nem todo rio monitorado deságua direto no Guaíba: Jacuí, Sinos, Caí e
 * Gravataí chegam diretamente; o Taquari deságua no Delta do Jacuí, que só
 * depois alcança o Guaíba. Os percentuais de contribuição de volume
 * (contribuicaoPercentual) vêm de documento da Prefeitura de Porto Alegre /
 * DMAE sobre o Lago Guaíba — o Taquari não tem percentual próprio porque
 * sua contribuição já é contabilizada indiretamente através do Jacuí.
 */

export const ESTACAO_GASOMETRO: ConfigEstacao = {
  codigo: "87450020",
  nome: "Usina do Gasômetro",
  rio: "Guaíba",
  municipio: "Porto Alegre",
  cotaAtencaoMetros: 2.08,
  cotaInundacaoMetros: 2.6,
  relacaoComGuaiba: "direto",
};

export const ESTACAO_CAIS_MAUA: ConfigEstacao = {
  codigo: "87450004",
  nome: "Cais Mauá C6",
  rio: "Guaíba",
  municipio: "Porto Alegre",
  cotaAtencaoMetros: 2.4,
  cotaInundacaoMetros: 3.0,
  relacaoComGuaiba: "direto",
};

export const ESTACOES_PORTO_ALEGRE: ConfigEstacao[] = [ESTACAO_GASOMETRO, ESTACAO_CAIS_MAUA];

/** @deprecated use ESTACOES_PORTO_ALEGRE — mantido para compatibilidade com buscarNivelGuaiba(). */
export const ESTACAO_GUAIBA = ESTACAO_GASOMETRO;

export const ESTACOES_AFLUENTES: ConfigEstacao[] = [
  { codigo: "85400000", nome: "Dona Francisca", rio: "Jacuí", municipio: "Dona Francisca", cotaAtencaoMetros: 6.4, cotaInundacaoMetros: 7.5, relacaoComGuaiba: "direto", contribuicaoPercentual: 84.6 },
  { codigo: "85900000", nome: "Rio Pardo", rio: "Jacuí", municipio: "Rio Pardo", cotaAtencaoMetros: 10.6, cotaInundacaoMetros: 12.5, relacaoComGuaiba: "direto", contribuicaoPercentual: 84.6 },
  { codigo: "87170000", nome: "São Sebastião do Caí", rio: "Caí", municipio: "São Sebastião do Caí", cotaAtencaoMetros: 8.5, cotaInundacaoMetros: 10.0, relacaoComGuaiba: "direto", contribuicaoPercentual: 5.2 },
  { codigo: "87376000", nome: "Taquara", rio: "Sinos", municipio: "Taquara", cotaAtencaoMetros: 5.1, cotaInundacaoMetros: 6.0, relacaoComGuaiba: "direto", contribuicaoPercentual: 7.5 },
  { codigo: "87399000", nome: "Passo das Canoas", rio: "Gravataí", municipio: "Gravataí", cotaAtencaoMetros: 4.0, cotaInundacaoMetros: 4.75, relacaoComGuaiba: "direto", contribuicaoPercentual: 2.7 },
  { codigo: "86879300", nome: "Lajeado", rio: "Taquari", municipio: "Lajeado", cotaAtencaoMetros: 16.2, cotaInundacaoMetros: 19.0, relacaoComGuaiba: "via-delta-jacui" },
  { codigo: "86510000", nome: "Muçum", rio: "Taquari", municipio: "Muçum", cotaAtencaoMetros: 15.3, cotaInundacaoMetros: 18.0, relacaoComGuaiba: "via-delta-jacui" },
  { codigo: "86720000", nome: "Encantado", rio: "Taquari", municipio: "Encantado", cotaAtencaoMetros: 10.2, cotaInundacaoMetros: 12.0, relacaoComGuaiba: "via-delta-jacui" },
];
