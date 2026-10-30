"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon, MagnifyingGlassIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { searchProjectByKeyword } from "@/features/project/project";

export default function ProjectSearchPanel({ isOpen, onClose, projectId, initialKeyword = "" }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [results, setResults] = useState(null);
  const [counts, setCounts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialKeyword) setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialKeyword?.trim()) {
      void runSearch(initialKeyword.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialKeyword]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function runSearch(term) {
    if (!term.trim()) return;
    setIsLoading(true);
    setError("");
    setResults(null);
    setCounts(null);
    try {
      const res = await searchProjectByKeyword(projectId, term.trim());
      if (!res?.success) {
        setError(res?.message || "Search failed.");
        return;
      }
      setResults(res.data?.results);
      setCounts(res.data?.counts);
    } catch {
      setError("An unexpected error occurred while searching.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    void runSearch(keyword);
  }

  if (!isOpen) return null;

  const meetings = results?.meetings || [];
  const totalCount = counts?.total ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white text-gray-900 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-[#2563EB]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Project Intelligence Search
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-b border-gray-100 p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search meetings, notes, agendas…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-20 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !keyword.trim()}
              className="absolute inset-y-1 right-1 flex items-center rounded-lg bg-[#2563EB] px-3 text-[11px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-40 transition"
            >
              {isLoading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
              <p className="text-xs">Searching project records…</p>
            </div>
          )}

          {!isLoading && results && totalCount === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
              <p className="text-xs font-semibold text-gray-800">No matching records found</p>
              <p className="mt-1 text-[11px]">Try searching with a different term.</p>
            </div>
          )}

          {!isLoading && meetings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-semibold uppercase tracking-wider">Meetings & Notes ({meetings.length})</span>
              </div>

              {meetings.map((m) => (
                <div
                  key={m.id || m._id}
                  className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 transition hover:border-blue-400 hover:bg-white shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-900">{m.title}</p>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB] border border-blue-200 capitalize">
                      {m.status?.replace("_", " ")}
                    </span>
                  </div>
                  {m.startTime && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-500">
                      <CalendarDaysIcon className="h-3 w-3 text-gray-400" />
                      <span>{new Date(m.startTime).toLocaleString()}</span>
                    </div>
                  )}
                  {m.description && (
                    <p className="mt-2 text-[11px] text-gray-600 line-clamp-2">{m.description}</p>
                  )}
                  {m.notes && (
                    <div className="mt-2 rounded-lg bg-white border border-gray-200 p-2.5 text-[11px] text-gray-700">
                      <p className="font-semibold text-gray-900 mb-0.5">Meeting Notes:</p>
                      <p className="line-clamp-3">{m.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isLoading && !results && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-300 stroke-1 mb-2" />
              <p className="text-xs font-semibold text-gray-700">Instant Project Search</p>
              <p className="mt-1 text-[11px] max-w-[200px] text-gray-500">
                Search through meeting agendas, notes, discussions, and alignments.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
