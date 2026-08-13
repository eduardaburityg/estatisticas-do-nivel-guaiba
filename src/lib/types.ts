export type StatusRio = "normal" | "alerta" | "critico";

export interface LeituraNivel {
  dataHora: string;
  nivelMetros: number;
}

export interface NivelEstacao {
  estacaoCodigo: string;
  estacaoNome: string;
  rio: string;
  municipio: string;
  relacaoComGuaiba: "direto" | "via-delta-jacui";
  contribuicaoPercentual?: number;
  nivelAtualMetros: number;
  cotaInundacaoMetros: number;
  cotaAtencaoMetros: number;
  status: StatusRio;
  tendencia: "subindo" | "descendo" | "estavel";
  variacaoCmPorHora: number;
  atualizadoEm: string;
  historico: LeituraNivel[];
  fonte: string;
  modoDemonstracao: boolean;
}

export type NivelGuaiba = NivelEstacao;

export interface PrevisaoHoraria {
  hora: string;
  temperaturaC: number;
  chuvaMm: number;
  probabilidadeChuva: number;
}

export interface Clima {
  temperaturaAtualC: number;
  sensacaoC: number;
  chuvaHojeMm: number;
  chuvaProximos7DiasMm: number;
  ventoKmh: number;
  direcaoVento: number;
  previsaoHoraria: PrevisaoHoraria[];
  atualizadoEm: string;
  fonte: string;
}

export interface ContatoEmergencia {
  id: string;
  nome: string;
  telefone: string;
  telefoneExibicao: string;
  descricao: string;
  disponibilidade: string;
}

export interface PontoApoio {
  id: string;
  nome: string;
  tipo: "abrigo" | "doacao" | "saude" | "resgate";
  bairro: string;
  endereco: string;
  capacidade?: number;
  observacoes?: string;
  latitude: number;
  longitude: number;
}

export type TipoSolicitacao = "pedido" | "oferta";
export type StatusSolicitacao = "pendente" | "aprovado" | "concluido";

export interface SolicitacaoAjuda {
  id: string;
  tipo: TipoSolicitacao;
  nome: string;
  cidade: string;
  bairro: string | null;
  categoria: string;
  descricao: string | null;
  telefone: string | null;
  status: StatusSolicitacao;
  created_at: string;
}

export type NovaSolicitacaoAjuda = Pick<
  SolicitacaoAjuda,
  "tipo" | "nome" | "cidade" | "categoria"
> &
  Partial<Pick<SolicitacaoAjuda, "bairro" | "descricao" | "telefone">>;
