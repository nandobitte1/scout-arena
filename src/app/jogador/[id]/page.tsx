"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlayerResult } from "@/types";

function StatBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85
      ? "bg-emerald-500"
      : value >= 75
        ? "bg-green-500"
        : value >= 65
          ? "bg-yellow-500"
          : value >= 50
            ? "bg-orange-500"
            : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-xs font-bold text-gray-400 uppercase">
        {label}
      </span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-700">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(value, 99)}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm font-bold text-white">
        {value}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    free: {
      label: "Livre",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    donated: {
      label: "Com Dono",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    negotiation: {
      label: "Em Negociação",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    unknown: {
      label: "N/A",
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
  };

  const c = config[status as keyof typeof config] || config.unknown;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase ${c.className}`}
    >
      {c.label}
    </span>
  );
}

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PlayerResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    fetch(`/api/players/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!data || (!data.arena && !data.sofifa)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
        <p className="mb-4 text-lg text-gray-400">Jogador não encontrado</p>
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Voltar
        </button>
      </div>
    );
  }

  const { arena, sofifa } = data;
  const name = sofifa?.name || arena?.name || "Desconhecido";
  const photo = sofifa?.headshotUrl || arena?.photoUrl || "";

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">{name}</h1>
          {arena && <StatusBadge status={arena.status} />}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-800 shadow-xl">
            {photo ? (
              <img
                src={photo}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-gray-600">
                {name.charAt(0)}
              </div>
            )}
            {sofifa?.overall && (
              <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white shadow-lg">
                {sofifa.overall}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-white">{name}</h2>
            {sofifa?.fullName && sofifa.fullName !== name && (
              <p className="text-sm text-gray-400">{sofifa.fullName}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-300 sm:justify-start">
              {sofifa?.positions?.length ? (
                <span className="rounded-lg bg-emerald-600/20 px-3 py-1 text-emerald-400 font-medium">
                  {sofifa.positions.join(" / ")}
                </span>
              ) : arena?.position ? (
                <span className="rounded-lg bg-emerald-600/20 px-3 py-1 text-emerald-400 font-medium">
                  {arena.position}
                </span>
              ) : null}
              {sofifa?.age ? <span>{sofifa.age} anos</span> : null}
              {sofifa?.nationality ? <span>{sofifa.nationality}</span> : null}
              {sofifa?.height ? <span>{sofifa.height}</span> : null}
              {sofifa?.potential && sofifa.potential > (sofifa.overall || 0) && (
                <span className="text-emerald-400 font-bold">
                  POT {sofifa.potential}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {arena && (
              <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Arena Virtual
                </h3>
                <div className="space-y-0">
                  <InfoRow
                    label="Time"
                    value={arena.teamName || "Sem Clube"}
                  />
                  {arena.value > 0 && (
                    <InfoRow
                      label="Valor na Liga"
                      value={`${arena.value.toLocaleString("pt-BR")}`}
                    />
                  )}
                  <InfoRow
                    label="Status"
                    value={
                      arena.status === "free"
                        ? "Livre"
                        : arena.status === "donated"
                          ? "Com Dono"
                          : arena.status === "negotiation"
                            ? "Em Negociação"
                            : "N/A"
                    }
                  />
                  {arena.nationality && (
                    <InfoRow label="Nacionalidade" value={arena.nationality} />
                  )}
                </div>
                <a
                  href={`https://arenavirtual.arenavirtual.net/jogador/${arena.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gray-700 py-2 text-xs text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
                >
                  Ver no Painel
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {sofifa && (
              <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-wider">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  SOFIFA / FIFA
                </h3>
                <div className="space-y-0">
                  <InfoRow label="Clube" value={sofifa.club || "N/A"} />
                  <InfoRow label="Idade" value={`${sofifa.age} anos`} />
                  <InfoRow label="Altura" value={sofifa.height || "N/A"} />
                  <InfoRow label="Pé" value={sofifa.foot || "N/A"} />
                  <InfoRow label="Overall" value={sofifa.overall} />
                  <InfoRow label="Potencial" value={sofifa.potential} />
                  {sofifa.weakFoot > 0 && (
                    <InfoRow
                      label="Weak Foot"
                      value={`${"★".repeat(sofifa.weakFoot)}${"☆".repeat(5 - sofifa.weakFoot)}`}
                    />
                  )}
                  {sofifa.skillMoves > 0 && (
                    <InfoRow
                      label="Skill Moves"
                      value={`${"★".repeat(sofifa.skillMoves)}${"☆".repeat(5 - sofifa.skillMoves)}`}
                    />
                  )}
                  {sofifa.workrateAtt && (
                    <InfoRow label="Workrate" value={`${sofifa.workrateAtt} / ${sofifa.workrateDef}`} />
                  )}
                  {sofifa.value && (
                    <InfoRow label="Valor FIFA" value={sofifa.value} />
                  )}
                  {sofifa.wage && (
                    <InfoRow label="Salário" value={sofifa.wage} />
                  )}
                  {sofifa.releaseClause && (
                    <InfoRow label="Cláusula" value={sofifa.releaseClause} />
                  )}
                </div>
                {sofifa.playStyles?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs text-gray-400">Play Styles</p>
                    <div className="flex flex-wrap gap-1">
                      {sofifa.playStyles.map((style) => (
                        <span
                          key={style}
                          className="rounded-md bg-blue-600/20 px-2 py-0.5 text-[10px] font-medium text-blue-300"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <a
                  href={`https://sofifa.com/player/${sofifa.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gray-700 py-2 text-xs text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
                >
                  Ver no SOFIFA
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {sofifa?.stats && (
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-purple-400 uppercase tracking-wider">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Atributos
              </h3>
              <div className="space-y-3">
                <StatBar label="Pace" value={sofifa.stats.pace} />
                <StatBar label="Shooting" value={sofifa.stats.shooting} />
                <StatBar label="Passing" value={sofifa.stats.passing} />
                <StatBar label="Dribbling" value={sofifa.stats.dribbling} />
                <StatBar label="Defending" value={sofifa.stats.defending} />
                <StatBar label="Physical" value={sofifa.stats.physical} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-700/50 p-3 text-center">
                  <div className="text-2xl font-black text-emerald-400">
                    {sofifa.overall}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-gray-400 uppercase">
                    Overall
                  </div>
                </div>
                <div className="rounded-lg bg-gray-700/50 p-3 text-center">
                  <div className="text-2xl font-black text-blue-400">
                    {sofifa.potential}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-gray-400 uppercase">
                    Potencial
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
