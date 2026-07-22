"use client";

import { POSITIONS, STATUS_OPTIONS, SearchFilters } from "@/types";

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const update = (patch: Partial<SearchFilters>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Filtros Avançados
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Posição
          </label>
          <select
            value={filters.position || ""}
            onChange={(e) => update({ position: e.target.value || undefined })}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Todas</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Status
          </label>
          <select
            value={filters.status || "all"}
            onChange={(e) =>
              update({ status: e.target.value as SearchFilters["status"] })
            }
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Idade Mín
          </label>
          <input
            type="number"
            min={15}
            max={45}
            value={filters.minAge || ""}
            onChange={(e) =>
              update({ minAge: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="16"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Idade Máx
          </label>
          <input
            type="number"
            min={15}
            max={45}
            value={filters.maxAge || ""}
            onChange={(e) =>
              update({ maxAge: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="40"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Overall Mín
          </label>
          <input
            type="number"
            min={40}
            max={99}
            value={filters.minOverall || ""}
            onChange={(e) =>
              update({ minOverall: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="70"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Overall Máx
          </label>
          <input
            type="number"
            min={40}
            max={99}
            value={filters.maxOverall || ""}
            onChange={(e) =>
              update({ maxOverall: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="99"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Valor Mín (k)
          </label>
          <input
            type="number"
            min={0}
            value={filters.minValue ? filters.minValue / 1000 : ""}
            onChange={(e) =>
              update({
                minValue: e.target.value
                  ? parseInt(e.target.value) * 1000
                  : undefined,
              })
            }
            placeholder="0"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Valor Máx (k)
          </label>
          <input
            type="number"
            min={0}
            value={filters.maxValue ? filters.maxValue / 1000 : ""}
            onChange={(e) =>
              update({
                maxValue: e.target.value
                  ? parseInt(e.target.value) * 1000
                  : undefined,
              })
            }
            placeholder="500"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Nacionalidade
          </label>
          <input
            type="text"
            value={filters.nationality || ""}
            onChange={(e) =>
              update({ nationality: e.target.value || undefined })
            }
            placeholder="Brasil"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() =>
            onChange({
              query: filters.query,
              position: undefined,
              status: "all",
              minAge: undefined,
              maxAge: undefined,
              minOverall: undefined,
              maxOverall: undefined,
              minValue: undefined,
              maxValue: undefined,
              nationality: undefined,
            })
          }
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
