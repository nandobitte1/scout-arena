"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import PlayerCard from "@/components/PlayerCard";
import { SearchFilters, PlayerResult } from "@/types";

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    status: "all",
  });
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (query: string) => {
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.position) params.set("position", filters.position);
    if (filters.status && filters.status !== "all")
      params.set("status", filters.status);
    if (filters.minAge) params.set("minAge", String(filters.minAge));
    if (filters.maxAge) params.set("maxAge", String(filters.maxAge));
    if (filters.minOverall) params.set("minOvr", String(filters.minOverall));
    if (filters.maxOverall) params.set("maxOvr", String(filters.maxOverall));
    if (filters.minValue) params.set("minValue", String(filters.minValue));
    if (filters.maxValue) params.set("maxValue", String(filters.maxValue));
    if (filters.nationality) params.set("nationality", filters.nationality);

    try {
      const res = await fetch(`/api/players/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (newFilters.query) {
      doSearch(newFilters.query);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">
              SA
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Scout Arena</h1>
              <p className="text-xs text-gray-400">
                Busca de jogadores Arena Virtual + SOFIFA
              </p>
            </div>
          </div>
          <a
            href="https://arenavirtual.arenavirtual.net/pcontrole/negociacoes"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          >
            Painel Arena Virtual
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 space-y-4">
          <SearchBar
            onSearch={doSearch}
            initialValue={filters.query || ""}
          />
          <FilterPanel filters={filters} onChange={handleFilterChange} />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-gray-400">Buscando jogadores...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="py-20 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-lg text-gray-400">
              Nenhum jogador encontrado
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Tente buscar por outro nome ou ajuste os filtros
            </p>
          </div>
        )}

        {!loading && !searched && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-500">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            <p className="text-lg text-gray-400">
              Busque por um jogador para começar
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Dados combinados da Arena Virtual e SOFIFA
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="mb-4 text-sm text-gray-400">
              {results.length} jogador{results.length !== 1 ? "es" : ""} encontrado
              {results.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {results.map((result, i) => (
                <PlayerCard key={i} result={result} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
