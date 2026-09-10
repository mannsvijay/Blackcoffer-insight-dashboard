import { useEffect, useRef, useState } from "react";

/**
 * Generic multi-select dropdown used for every filter field. Includes an
 * inline search box once there are more than a handful of options, since
 * some fields here have very high cardinality (topic: 97 values, source:
 * 403 values) and a plain checkbox list would be unusable at that size.
 *
 * When `disabled` is true, the trigger renders visibly greyed out and
 * shows `disabledReason` in a native title tooltip on hover/focus - used
 * for the City and SWOT filters, which the source dataset has no data for.
 */
export default function MultiSelectDropdown({ label, options, selected, onChange, disabled, disabledReason }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    String(opt.label ?? opt).toLowerCase().includes(search.toLowerCase())
  );

  function toggleValue(value) {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
        onClick={() => setOpen((o) => !o)}
        className={`text-xs px-3 py-2 rounded-md border flex items-center gap-1.5 transition-colors ${
          disabled
            ? "border-border text-muted/50 cursor-not-allowed bg-surface/40"
            : selected.length > 0
            ? "border-gold/60 text-ink bg-gold/10"
            : "border-border text-ink bg-surface hover:border-muted"
        }`}
      >
        {label}
        {selected.length > 0 && <span className="text-gold">({selected.length})</span>}
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1.5 w-60 bg-surfaceRaised border border-border rounded-lg shadow-xl p-2">
          {options.length > 8 && (
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full text-xs bg-base border border-border rounded px-2 py-1.5 mb-1.5 text-ink placeholder:text-muted focus-visible:outline-none focus-visible:border-teal"
            />
          )}
          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length === 0 && (
              <p className="text-xs text-muted px-2 py-1.5">No matching options.</p>
            )}
            {filteredOptions.map((opt) => {
              const value = opt.value ?? opt;
              const displayLabel = opt.label ?? opt;
              return (
                <label
                  key={value}
                  className="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-surface cursor-pointer text-ink"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(value)}
                    onChange={() => toggleValue(value)}
                    className="accent-teal"
                  />
                  <span className="truncate">{displayLabel}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
