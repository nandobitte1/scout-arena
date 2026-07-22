"use client";

import Link from "next/link";
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
    <div className="flex items-center gap-2">
      <span className="w-8 text-xs font-bold text-gray-400 uppercase">
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-700">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(value, 99)}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold text-white">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    free: { label: "Livre", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    donated: { label: "Com Dono", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    negotiation: { label: "Negociando", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    unknown: { label: "N/A", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  };

  const c = config[status as keyof typeof config] || config.unknown;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${c.className}`}
    >
      {c.label}
    </span>
  );
}

export default function PlayerCard({ result }: { result: PlayerResult }) {
  const { arena, sofifa } = result;
  const name = sofifa?.name || arena?.name || "Desconhecido";
  const playerId = sofifa?.id || arena?.sofifaId || 0;
  const photo =
    sofifa?.headshotUrl ||
    arena?.photoUrl ||
    "";

  return (
    <Link
      href={`/jogador/${playerId}`}
      className="group block overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/50 transition-all hover:border-emerald-500/50 hover:bg-gray-800 hover:shadow-lg hover:shadow-emerald-500/5"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-700">
            {photo ? (
              <img
                src={photo}
                alt={name}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500">
                {name.charAt(0)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="truncate text-base font-bold text-white group-hover:text-emerald-400">
                  {name}
                </h3>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  {sofifa?.positions?.length ? (
                    <span>{sofifa.positions.join(", ")}</span>
                  ) : arena?.position ? (
                    <span>{arena.position}</span>
                  ) : null}
                  {sofifa?.age ? <span>{sofifa.age} anos</span> : null}
                  {sofifa?.nationality ? (
                    <span>{sofifa.nationality}</span>
                  ) : null}
                </div>
              </div>

              {arena && <StatusBadge status={arena.status} />}
            </div>

            <div className="mt-2 flex items-center gap-4 text-xs">
              {arena?.teamName && (
                <span className="text-gray-400">
                  <span className="text-gray-500">Time:</span>{" "}
                  <span className="text-white">{arena.teamName}</span>
                </span>
              )}
              {arena?.value ? (
                <span className="text-gray-400">
                  <span className="text-gray-500">Valor:</span>{" "}
                  <span className="text-emerald-400 font-bold">
                    {arena.value.toLocaleString("pt-BR")}
                  </span>
                </span>
              ) : null}
              {sofifa?.overall ? (
                <span className="text-gray-400">
                  <span className="text-gray-500">OVR:</span>{" "}
                  <span className="text-white font-bold">{sofifa.overall}</span>
                  {sofifa.potential > sofifa.overall && (
                    <span className="text-emerald-400">
                      {" "}→ {sofifa.potential}
                    </span>
                  )}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {sofifa?.stats && (
          <div className="mt-3 space-y-1 border-t border-gray-700/50 pt-3">
            <StatBar label="PAC" value={sofifa.stats.pace} />
            <StatBar label="SHO" value={sofifa.stats.shooting} />
            <StatBar label="PAS" value={sofifa.stats.passing} />
            <StatBar label="DRI" value={sofifa.stats.dribbling} />
            <StatBar label="DEF" value={sofifa.stats.defending} />
            <StatBar label="PHY" value={sofifa.stats.physical} />
          </div>
        )}
      </div>
    </Link>
  );
}
