export function ChartSkeleton() {
  return (
    <div className="h-full w-full animate-pulse flex flex-col gap-3 p-1">
      <div className="h-3 w-1/3 bg-surfaceRaised rounded" />
      <div className="flex-1 bg-surfaceRaised rounded" />
    </div>
  );
}

export function EmptyState({ message = "No records match the current filters." }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-1 py-10">
      <p className="text-sm text-ink">{message}</p>
      <p className="text-xs text-muted">Try removing a filter to widen the results.</p>
    </div>
  );
}

export function ErrorState({ message = "Could not load this data." }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-1 py-10">
      <p className="text-sm" style={{ color: "#C97064" }}>
        {message}
      </p>
      <p className="text-xs text-muted">Check that the API server is running and reachable.</p>
    </div>
  );
}
