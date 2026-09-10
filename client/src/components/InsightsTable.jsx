import { useEffect, useState } from "react";
import { fetchInsights } from "../api/insights.js";
import { useFetch } from "../hooks/useFetch.js";
import { EmptyState, ErrorState } from "./StateViews.jsx";
import InsightModal from "./InsightModal.jsx";

const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "topic", label: "Topic" },
  { key: "sector", label: "Sector" },
  { key: "country", label: "Country" },
  { key: "region", label: "Region" },
  { key: "intensity", label: "Intensity" },
  { key: "likelihood", label: "Likelihood" },
  { key: "relevance", label: "Relevance" },
  { key: "start_year", label: "Year" },
  { key: "source", label: "Source" },
];

function cellValue(row, key) {
  const value = row[key];
  if (value === null || value === undefined || value === "") return <span className="text-muted">—</span>;
  if (key === "title") return <span className="line-clamp-1">{value}</span>;
  return value;
}

export default function InsightsTable({ filters }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const limit = 15;

  const { data, loading, error } = useFetch(
    () => fetchInsights(filters, page, limit),
    [JSON.stringify(filters), page]
  );

  // Reset to page 1 whenever filters change - a new filter combo shouldn't
  // leave the user stranded on a page that no longer exists.
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    setPage(1);
  }, [filtersKey]);

  return (
    <section className="bg-surface border border-border rounded-lg overflow-hidden">
      <header className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-sm font-semibold text-ink">Insights</h3>
        <p className="text-xs text-muted mt-0.5">Click any row for full detail and source link</p>
      </header>

      {loading ? (
        <div className="p-5 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-surfaceRaised rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-5">
          <ErrorState message={error} />
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="p-5">
          <EmptyState />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="px-4 py-2.5 font-medium whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelected(row)}
                    className="border-b border-border/60 hover:bg-surfaceRaised cursor-pointer text-ink"
                  >
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-4 py-2.5 max-w-[220px] truncate">
                        {cellValue(row, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} total records
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={data.pagination.page <= 1}
                className="px-2.5 py-1 rounded border border-border disabled:opacity-40 hover:enabled:text-ink"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, data.pagination.totalPages))}
                disabled={data.pagination.page >= data.pagination.totalPages}
                className="px-2.5 py-1 rounded border border-border disabled:opacity-40 hover:enabled:text-ink"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <InsightModal insight={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
