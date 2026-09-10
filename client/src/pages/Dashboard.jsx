import { fetchFilterOptions } from "../api/insights.js";
import { useFetch } from "../hooks/useFetch.js";
import { useFilters } from "../hooks/useFilters.js";
import FilterBar from "../components/FilterBar.jsx";
import KpiCards from "../components/KpiCards.jsx";
import IntensityTrendChart from "../components/charts/IntensityTrendChart.jsx";
import VolumeOverTimeChart from "../components/charts/VolumeOverTimeChart.jsx";
import LikelihoodRelevanceScatter from "../components/charts/LikelihoodRelevanceScatter.jsx";
import AggregateBarChart from "../components/charts/AggregateBarChart.jsx";
import PestleDonutChart from "../components/charts/PestleDonutChart.jsx";
import InsightsTable from "../components/InsightsTable.jsx";
import { ErrorState } from "../components/StateViews.jsx";

export default function Dashboard() {
  const { filters, setFilter, clearFilters, activeCount, queryParams } = useFilters();
  const { data: filterOptions, loading: filtersLoading, error: filtersError } = useFetch(
    fetchFilterOptions,
    []
  );

  return (
    <div className="min-h-screen bg-base">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="font-display text-xl font-semibold text-ink">Insight Analytics Dashboard</h1>
          <p className="text-xs text-muted mt-1">
            Energy, economic and industry insights — intensity, likelihood and relevance across topics,
            sectors and regions
          </p>
        </div>
      </header>

      {filtersLoading ? (
        <div className="max-w-7xl mx-auto px-6 py-3 text-xs text-muted">Loading filters…</div>
      ) : filtersError ? (
        <div className="max-w-7xl mx-auto px-6 py-3">
          <ErrorState message={filtersError} />
        </div>
      ) : (
        <FilterBar
          filterOptions={filterOptions}
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          activeCount={activeCount}
        />
      )}

      <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
        <KpiCards filters={queryParams} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntensityTrendChart filters={queryParams} />
          <VolumeOverTimeChart filters={queryParams} />
          <LikelihoodRelevanceScatter filters={queryParams} />
          <AggregateBarChart
            title="Insights by topic"
            question="Top 12 topics by number of insights (97 unique topics total)"
            groupBy="topic"
            filters={queryParams}
          />
          <AggregateBarChart
            title="Insights by sector"
            question="Number of insights per sector"
            groupBy="sector"
            filters={queryParams}
          />
          <PestleDonutChart filters={queryParams} />
          <AggregateBarChart
            title="Top countries"
            question="Top 12 countries by number of insights (records with no country recorded are excluded from this ranking)"
            groupBy="country"
            filters={queryParams}
          />
          <AggregateBarChart
            title="Insights by region"
            question="Number of insights per region"
            groupBy="region"
            filters={queryParams}
          />
        </div>

        <InsightsTable filters={queryParams} />
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-6 text-[11px] text-muted">
        Data source: jsondata.json (1000 records) · City and SWOT filters are shown disabled because the
        source dataset contains neither field.
      </footer>
    </div>
  );
}
