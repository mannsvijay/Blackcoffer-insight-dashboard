import { fetchKpis } from "../api/insights.js";
import { useFetch } from "../hooks/useFetch.js";
import { formatNumber, formatDecimal } from "../utils/format.js";

function KpiCard({ label, value, footnote }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink mt-1">{value}</p>
      {footnote && <p className="text-[11px] text-muted mt-1">{footnote}</p>}
    </div>
  );
}

/**
 * KPI row - fully filter-aware. Averages are computed server-side over
 * non-null values only (see server/controllers/insightController.js), so
 * the "coverage" footnote makes that exclusion visible rather than hiding
 * it behind a clean-looking number.
 */
export default function KpiCards({ filters }) {
  const { data, loading, error } = useFetch(() => fetchKpis(filters), [JSON.stringify(filters)]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface border border-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4 text-sm" style={{ color: "#C97064" }}>
        {error || "Could not load summary numbers."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard label="Total insights" value={formatNumber(data.total)} />
      <KpiCard
        label="Avg. intensity"
        value={formatDecimal(data.avgIntensity)}
        footnote={`from ${formatNumber(data.coverage?.intensity)} scored records`}
      />
      <KpiCard
        label="Avg. likelihood"
        value={formatDecimal(data.avgLikelihood)}
        footnote={`from ${formatNumber(data.coverage?.likelihood)} scored records`}
      />
      <KpiCard
        label="Avg. relevance"
        value={formatDecimal(data.avgRelevance)}
        footnote={`from ${formatNumber(data.coverage?.relevance)} scored records`}
      />
    </div>
  );
}
