import { ChartSkeleton, EmptyState, ErrorState } from "./StateViews.jsx";

/**
 * Shared frame for every chart on the dashboard: title, the analytical
 * question it answers, and consistent loading/error/empty handling so
 * each chart component only has to worry about rendering its own Recharts
 * markup once data is available.
 */
export default function ChartPanel({ title, question, loading, error, isEmpty, wide, children }) {
  return (
    <section
      className={`bg-surface border border-border rounded-lg p-5 flex flex-col ${
        wide ? "lg:col-span-2" : ""
      }`}
    >
      <header className="mb-3">
        <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
        {question && <p className="text-xs text-muted mt-0.5">{question}</p>}
      </header>
      <div className="flex-1 min-h-[260px]">
        {loading ? (
          <ChartSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
