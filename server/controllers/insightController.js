import Insight from "../models/Insight.js";
import buildFilterQuery from "../utils/buildFilterQuery.js";

const FILTERABLE_FIELDS = ["country", "region", "topic", "sector", "pestle", "source"];

/**
 * GET /api/insights
 * Paginated, filtered list of raw insight records - powers the data table.
 */
export async function getInsights(req, res, next) {
  try {
    const filter = buildFilterQuery(req.query);

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 200);
    const skip = (page - 1) * limit;

    const sortField = ["intensity", "likelihood", "relevance", "start_year", "end_year", "added"].includes(
      req.query.sortBy
    )
      ? req.query.sortBy
      : "added";
    const sortDir = req.query.sortDir === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      Insight.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit).lean(),
      Insight.countDocuments(filter),
    ]);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/insights/filters
 * Distinct, non-null values for every filterable field, computed live from
 * the actual collection (never hardcoded) so the UI always reflects what's
 * really in the database.
 */
export async function getFilterOptions(req, res, next) {
  try {
    const results = await Promise.all(
      FILTERABLE_FIELDS.map((field) =>
        Insight.distinct(field, { [field]: { $ne: null } })
      )
    );

    const options = {};
    FILTERABLE_FIELDS.forEach((field, i) => {
      options[field] = results[i].filter(Boolean).sort((a, b) => a.localeCompare(b));
    });

    const [startYears, endYears] = await Promise.all([
      Insight.distinct("start_year", { start_year: { $ne: null } }),
      Insight.distinct("end_year", { end_year: { $ne: null } }),
    ]);
    options.start_year = startYears.sort((a, b) => a - b);
    options.end_year = endYears.sort((a, b) => a - b);

    // City and SWOT are requested by the assignment brief but do not exist
    // anywhere in the source dataset. Reported explicitly (rather than
    // omitted) so the frontend can render them as disabled with a reason,
    // instead of silently not showing them.
    options.city = { available: false, reason: "No city field exists in the source dataset." };
    options.swot = { available: false, reason: "No SWOT field or classification exists in the source dataset." };

    res.json(options);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/insights/kpis
 * Filter-aware summary numbers for the KPI cards.
 * Averages are computed over non-null values only - missing data is
 * excluded, never treated as zero.
 */
export async function getKpis(req, res, next) {
  try {
    const filter = buildFilterQuery(req.query);

    const [result] = await Insight.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgIntensity: { $avg: "$intensity" },
          avgLikelihood: { $avg: "$likelihood" },
          avgRelevance: { $avg: "$relevance" },
          intensityCount: { $sum: { $cond: [{ $ne: ["$intensity", null] }, 1, 0] } },
          likelihoodCount: { $sum: { $cond: [{ $ne: ["$likelihood", null] }, 1, 0] } },
          relevanceCount: { $sum: { $cond: [{ $ne: ["$relevance", null] }, 1, 0] } },
        },
      },
    ]);

    res.json(
      result
        ? {
            total: result.total,
            avgIntensity: round2(result.avgIntensity),
            avgLikelihood: round2(result.avgLikelihood),
            avgRelevance: round2(result.avgRelevance),
            coverage: {
              intensity: result.intensityCount,
              likelihood: result.likelihoodCount,
              relevance: result.relevanceCount,
            },
          }
        : { total: 0, avgIntensity: null, avgLikelihood: null, avgRelevance: null, coverage: {} }
    );
  } catch (err) {
    next(err);
  }
}

const GROUPABLE_FIELDS = ["topic", "sector", "region", "country", "pestle", "start_year"];
const METRICS = ["count", "avgIntensity", "avgLikelihood", "avgRelevance"];

/**
 * GET /api/insights/aggregate?groupBy=topic&metric=count
 * Single generic aggregation endpoint that powers every bar/donut/line
 * chart on the dashboard, so chart data is always computed in MongoDB
 * rather than reduced client-side from raw records.
 *
 * For fields with meaningful missingness (topic, sector, region, pestle),
 * empty values are bucketed into "Not Specified" rather than dropped -
 * see README "Missing data handling" for the reasoning.
 * For country specifically, missing values are excluded (see same section).
 */
export async function getAggregate(req, res, next) {
  try {
    const { groupBy, metric = "count" } = req.query;

    if (!GROUPABLE_FIELDS.includes(groupBy)) {
      return res.status(400).json({
        error: `Invalid groupBy. Must be one of: ${GROUPABLE_FIELDS.join(", ")}`,
      });
    }
    if (!METRICS.includes(metric)) {
      return res.status(400).json({ error: `Invalid metric. Must be one of: ${METRICS.join(", ")}` });
    }

    const filter = buildFilterQuery(req.query);

    if (groupBy === "country") {
      filter.country = filter.country || { $ne: null };
    }

    const groupStage = {
      _id: groupBy === "country" ? "$country" : { $ifNull: [`$${groupBy}`, "Not Specified"] },
      count: { $sum: 1 },
      avgIntensity: { $avg: "$intensity" },
      avgLikelihood: { $avg: "$likelihood" },
      avgRelevance: { $avg: "$relevance" },
    };

    const pipeline = [
      { $match: filter },
      { $group: groupStage },
      { $sort: { [metric]: -1 } },
    ];

    const results = await Insight.aggregate(pipeline);

    res.json(
      results.map((r) => ({
        label: r._id === null || r._id === "" ? "Not Specified" : String(r._id),
        count: r.count,
        avgIntensity: round2(r.avgIntensity),
        avgLikelihood: round2(r.avgLikelihood),
        avgRelevance: round2(r.avgRelevance),
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/insights/timeseries?basis=start_year|added
 * Two distinct temporal views, because the two candidate "year" fields
 * have very different coverage (see README):
 *   - start_year: only ~31% of records populated, but semantically
 *     represents the year the insight/prediction applies to.
 *   - added: ~100% populated, represents when the record was published
 *     to the source database - used for a volume-over-time view that
 *     reflects the whole dataset honestly.
 */
export async function getTimeseries(req, res, next) {
  try {
    const basis = req.query.basis === "added" ? "added" : "start_year";
    const filter = buildFilterQuery(req.query);

    let pipeline;
    if (basis === "start_year") {
      filter.start_year = { $ne: null };
      pipeline = [
        { $match: filter },
        {
          $group: {
            _id: "$start_year",
            count: { $sum: 1 },
            avgIntensity: { $avg: "$intensity" },
          },
        },
        { $sort: { _id: 1 } },
      ];
    } else {
      filter.added = { $ne: null };
      pipeline = [
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$added" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ];
    }

    const results = await Insight.aggregate(pipeline);
    res.json(
      results.map((r) => ({
        label: String(r._id),
        count: r.count,
        avgIntensity: round2(r.avgIntensity),
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/insights/scatter   
 * Raw (unaggregated) likelihood/relevance/intensity triples for the
 * scatter chart - capped to a sane number of points. 
 * 
 * 
 */
export async function getScatterData(req, res, next) {
  try {
    const filter = buildFilterQuery(req.query);
    filter.likelihood = { $ne: null };
    filter.relevance = { $ne: null };

    const points = await Insight.find(filter)
      .select("likelihood relevance intensity title -_id")
      .limit(1000)
      .lean();

    res.json(points);
  } catch (err) {
    next(err);
  }
}

function round2(value) {
  return typeof value === "number" ? Math.round(value * 100) / 100 : null;
}
