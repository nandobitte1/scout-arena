export interface ArenaPlayer {
  id: number;
  name: string;
  slug: string;
  position: string;
  age: number;
  nationality: string;
  nationalityFlag: string;
  photoUrl: string;
  teamId: number | null;
  teamName: string | null;
  teamBadge: string | null;
  value: number;
  status: "donated" | "free" | "negotiation" | "unknown";
  lastNegotiation?: string;
  sofifaId: number;
}

export interface ArenaNegotiation {
  playerName: string;
  playerId: number;
  date: string;
  fromTeam: string;
  fromTeamBadge: string;
  toTeam: string;
  toTeamBadge: string;
  value: number;
  type: "compra" | "troca" | "emprestimo" | "demissao" | "devolucao";
}

export interface ArenaApiPlayer {
  id: number;
  nome: string;
  nome_completo: string;
  pais_id: number;
  time: string;
  overall: number;
  potencial: number;
  posicao_id: number;
  altura: number;
  peso: number;
  pe: string;
  idade: number;
  carta: { bola_id: number; bola_nome: string; bola_link: string } | null;
  foto: string;
  skillmoves: number;
  rep_internacional: number;
  dedicacao: string;
  pe_ruim: number;
  face_real: number;
  voleio: number;
  cabeceio: number;
  passe_curto: number;
  finalizacao: number;
  cruzamento: number;
  roubada_bola: number;
  carrinho: number;
  marcacao: number;
  chute_longe: number;
  forca: number;
  forca_chute: number;
  pulo: number;
  resistencia: number;
  agilidade: number;
  reacoes: number;
  velocidade_final: number;
  equilibrio: number;
  aceleracao: number;
  curva: number;
  passe_longe: number;
  drible: number;
  controle_bola: number;
  cobranca_falta: number;
  posicionamento: number;
  penalti: number;
  compostura: number;
  interceptacoes: number;
  visao_jogo: number;
  agressividade: number;
  porte_fisico: string;
  tipo_aceleracao: string;
  sofifa_rescisao_usd: string;
  sofifa_valor_usd: string;
  sofifa_salario_usd: string;
  grafico_finalizacao: number;
  grafico_passe: number;
  grafico_drible: number;
  grafico_defesa: number;
  grafico_fisico: number;
  grafico_velocidade: number;
  tipo: string;
  nome_escudo: string;
  link_escudo: string;
  posicao: string;
  posicao_2: string | null;
  nacionalidade: string;
  ddi: number;
  gol_temporada: number;
  gol_carreira: number;
  assistencia_temporada: number;
  assistencia_carreira: number;
  melhor_em_campo_carreira: number;
  bola: { bola_id: number; bola_nome: string; bola_link: string } | null;
  slug: string;
  passe: string;
  proclub: boolean;
  funcoes: Array<{
    posicao: string;
    titulo: string;
    familiaridade: string;
    descricao: string;
    itens: Array<{ nome: string; descricao: string }>;
  }>;
}

export interface ArenaApiSearchResult {
  id: number;
  nome: string;
  passe: string;
  posicao: string;
  overall: number;
  nacionalidade: string;
  nacionalidade_flag: string;
  nome_escudo: string;
  link_escudo: string;
  foto: string;
  usuario_id: number;
  usuario_id_emprestimo: number | null;
  nome_escudo_emprestimo: string;
  link_escudo_emprestimo: string;
  meu_jogador: boolean;
  multa: number;
  bola: { bola_id: number; bola_nome: string; bola_link: string } | null;
  inLeilao: boolean;
  a_venda: boolean;
  valor_a_venda: number | null;
  favorito: boolean;
}

export interface ArenaApiPaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface ArenaApiNegotiation {
  id: number;
  tipo: number;
  origem_id: number;
  destino_id: number;
  origem: string;
  destino: string;
  link_escudo_origem: string;
  link_escudo_destino: string;
  nome_escudo_origem: string;
  nome_escudo_destino: string;
  jogador: {
    id: number;
    nome: string;
    foto: string;
    overall: number;
    posicao: string;
    nacionalidade: string;
  };
}

export interface SofifaPlayer {
  id: number;
  name: string;
  fullName: string;
  positions: string[];
  overall: number;
  potential: number;
  age: number;
  height: string;
  weight: string;
  foot: string;
  weakFoot: number;
  skillMoves: number;
  workrateAtt: string;
  workrateDef: string;
  club: string;
  clubId: number;
  nationality: string;
  nationalityId: number;
  value: string;
  wage: string;
  releaseClause: string;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  playStyles: string[];
  headshotUrl: string;
  nationUrl: string;
  teamUrl: string;
  playerUrl: string;
}

export interface PlayerResult {
  arena: ArenaPlayer | null;
  sofifa: SofifaPlayer | null;
  arenaRaw?: ArenaApiPlayer | null;
}

export interface SearchFilters {
  query?: string;
  position?: string;
  status?: "donated" | "free" | "negotiation" | "all";
  minValue?: number;
  maxValue?: number;
  minAge?: number;
  maxAge?: number;
  minOverall?: number;
  maxOverall?: number;
  nationality?: string;
}

export type Position =
  | "GOL"
  | "ZAG"
  | "LAT"
  | "VOL"
  | "MOI"
  | "MEI"
  | "PE"
  | "PD"
  | "ATA"
  | "CA";

export const POSITIONS: Position[] = [
  "GOL", "ZAG", "LAT", "VOL", "MOI", "MEI", "PE", "PD", "ATA", "CA",
];

export const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "free", label: "Livre" },
  { value: "donated", label: "Com Dono" },
  { value: "negotiation", label: "Em Negociação" },
] as const;
