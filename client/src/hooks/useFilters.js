import { useMemo, useState, useCallback } from "react";

const EMPTY_FILTERS = {
  country: [],
  region: [],
  topic: [],
  sector: [],
  pestle: [],
  source: [],
  end_year: [],
};

/**
 * Owns all filter selections as arrays (supports multi-select) and exposes
 * a flat query-params object (comma-joined) that matches exactly what the
 * backend's buildFilterQuery expects.
 */
export function useFilters() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const setFilter = useCallback((field, values) => {
    setFilters((prev) => ({ ...prev, [field]: values }));
  }, []);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const activeCount = useMemo(
    () => Object.values(filters).reduce((sum, arr) => sum + arr.length, 0),
    [filters]
  );

  const queryParams = useMemo(() => {
    const params = {};
    for (const [key, values] of Object.entries(filters)) {
      if (values.length > 0) params[key] = values.join(",");
    }
    return params;
  }, [filters]);

  return { filters, setFilter, clearFilters, activeCount, queryParams };
}
