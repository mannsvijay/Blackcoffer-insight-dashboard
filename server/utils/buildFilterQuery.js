/**
 * Builds a Mongo filter object from Express query params.
 *
 * Supported filter params (all optional, all combinable with AND):
 *   country, region, topic, sector, pestle, source  -> comma-separated for multi-select
 *   start_year, end_year                             -> comma-separated years, OR the
 *                                                        literal value "unspecified" to
 *                                                        match records where that year is null
 *
 * City and SWOT are NOT included here because the dataset has no such fields
 * (see README "Known data limitations"). Sending those params is a no-op.
 */
const MULTI_SELECT_STRING_FIELDS = ["country", "region", "topic", "sector", "pestle", "source"];
const YEAR_FIELDS = ["start_year", "end_year"];

export function buildFilterQuery(query) {
  const filter = {};

  for (const field of MULTI_SELECT_STRING_FIELDS) {
    const raw = query[field];
    if (!raw) continue;
    const values = String(raw)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length === 1) {
      filter[field] = values[0];
    } else if (values.length > 1) {
      filter[field] = { $in: values };
    }
  }

  for (const field of YEAR_FIELDS) {
    const raw = query[field];
    if (!raw) continue;
    const tokens = String(raw)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const orClauses = [];
    const numericYears = [];
    for (const token of tokens) {
      if (token.toLowerCase() === "unspecified") {
        orClauses.push({ [field]: null });
      } else {
        const num = Number(token);
        if (!Number.isNaN(num)) numericYears.push(num);
      }
    }
    if (numericYears.length === 1) orClauses.push({ [field]: numericYears[0] });
    if (numericYears.length > 1) orClauses.push({ [field]: { $in: numericYears } });

    if (orClauses.length === 1) {
      Object.assign(filter, orClauses[0]);
    } else if (orClauses.length > 1) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: orClauses });
    }
  }

  return filter;
}

export default buildFilterQuery;
