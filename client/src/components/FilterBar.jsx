import MultiSelectDropdown from "./MultiSelectDropdown.jsx";

const FIELD_LABELS = {
  country: "Country",
  region: "Region",
  topic: "Topic",
  sector: "Sector",
  pestle: "PESTLE",
  source: "Source",
};

/**
 * The filter bar. Renders one dropdown per real filterable field, plus
 * City and SWOT permanently disabled with an explanatory tooltip, since
 * the source dataset (jsondata.json) contains neither field - see
 * README "Known data limitations" for the full explanation.
 */
export default function FilterBar({ filterOptions, filters, setFilter, clearFilters, activeCount }) {
  if (!filterOptions) return null;

  const endYearOptions = [
    { value: "unspecified", label: "Not specified" },
    ...filterOptions.end_year.map((y) => ({ value: String(y), label: String(y) })),
  ];

  return (
    <div className="sticky top-0 z-10 bg-base/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-2">
        {Object.entries(FIELD_LABELS).map(([field, label]) => (
          <MultiSelectDropdown
            key={field}
            label={label}
            options={filterOptions[field] || []}
            selected={filters[field]}
            onChange={(values) => setFilter(field, values)}
          />
        ))}

        <MultiSelectDropdown
          label="End year"
          options={endYearOptions}
          selected={filters.end_year}
          onChange={(values) => setFilter("end_year", values)}
        />

        <MultiSelectDropdown
          label="City"
          options={[]}
          selected={[]}
          onChange={() => {}}
          disabled
          disabledReason="No city field exists in the source dataset (jsondata.json)."
        />
        <MultiSelectDropdown
          label="SWOT"
          options={[]}
          selected={[]}
          onChange={() => {}}
          disabled
          disabledReason="No SWOT classification exists in the source dataset (jsondata.json)."
        />

        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs px-3 py-2 rounded-md border border-border text-muted hover:text-ink hover:border-muted ml-auto"
          >
            Clear filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
