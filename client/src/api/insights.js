import apiClient from "./client.js";

/**
 * Thin wrapper functions around every backend endpoint. Every function
 * accepts the same `filters` shape (an object of query params built by
 * useFilters) so the same filter state drives the table, KPIs, and every
 * chart consistently.
 */

export function fetchInsights(filters = {}, page = 1, limit = 25, sortBy, sortDir) {
  return apiClient
    .get("/insights", { params: { ...filters, page, limit, sortBy, sortDir } })
    .then((res) => res.data);
}

export function fetchFilterOptions() {
  return apiClient.get("/insights/filters").then((res) => res.data);
}

export function fetchKpis(filters = {}) {
  return apiClient.get("/insights/kpis", { params: filters }).then((res) => res.data);
}

export function fetchAggregate(groupBy, metric, filters = {}) {
  return apiClient
    .get("/insights/aggregate", { params: { ...filters, groupBy, metric } })
    .then((res) => res.data);
}

export function fetchTimeseries(basis, filters = {}) {
  return apiClient
    .get("/insights/timeseries", { params: { ...filters, basis } })
    .then((res) => res.data);
}

export function fetchScatterData(filters = {}) {
  return apiClient.get("/insights/scatter", { params: filters }).then((res) => res.data);
}
