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
