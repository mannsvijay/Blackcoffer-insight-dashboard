import { formatDate } from "../utils/format.js";

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/60 last:border-0">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs text-ink text-right">{value ?? "—"}</span>
    </div>
  );
}

export default function InsightModal({ insight, onClose }) {
  if (!insight) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surfaceRaised border border-border rounded-lg max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="font-display text-base font-semibold text-ink leading-snug">{insight.title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-ink text-lg leading-none shrink-0"
          >
            ×
          </button>
        </div>

        {insight.insight && <p className="text-xs text-muted mb-4">{insight.insight}</p>}

        <div>
          <DetailRow label="Topic" value={insight.topic} />
          <DetailRow label="Sector" value={insight.sector} />
          <DetailRow label="Country" value={insight.country} />
          <DetailRow label="Region" value={insight.region} />
          <DetailRow label="PESTLE" value={insight.pestle} />
          <DetailRow label="Intensity" value={insight.intensity} />
          <DetailRow label="Likelihood" value={insight.likelihood} />
          <DetailRow label="Relevance" value={insight.relevance} />
          {insight.impact !== null && insight.impact !== undefined && (
            <DetailRow label="Impact" value={insight.impact} />
          )}
          <DetailRow label="Start year" value={insight.start_year} />
          <DetailRow label="End year" value={insight.end_year} />
          <DetailRow label="Published" value={formatDate(insight.published)} />
          <DetailRow label="Added" value={formatDate(insight.added)} />
          <DetailRow label="Source" value={insight.source} />
        </div>

        {insight.url && (
          <a
            href={insight.url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 text-xs text-teal hover:underline"
          >
            View original source
          </a>
        )}
      </div>
    </div>
  );
}
