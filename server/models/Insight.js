import mongoose from "mongoose";

/**
 * Schema mirrors jsondata.json exactly - no fields are added or removed.
 * Empty strings from the source JSON are normalized to `null` at seed time
 * (see server/seed/seed.js) so that "missing" is represented consistently
 * and numeric fields can be queried/aggregated with $gt, $avg, etc.
 *
 * Fields are intentionally NOT `required`: the raw dataset has real,
 * legitimate missing values in many fields, and this schema must be able
 * to store the data exactly as given rather than rejecting it.
 */
const insightSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    insight: { type: String, default: "" },
    url: { type: String, default: "" },

    // Categorical / filterable fields
    sector: { type: String, default: null, index: true },
    topic: { type: String, default: null, index: true },
    region: { type: String, default: null, index: true },
    country: { type: String, default: null, index: true },
    pestle: { type: String, default: null, index: true },
    source: { type: String, default: null, index: true },

    // Numeric analytical fields
    intensity: { type: Number, default: null },
    likelihood: { type: Number, default: null },
    relevance: { type: Number, default: null },
    impact: { type: Number, default: null }, // sparse (~3% populated) - see README

    // Year fields - stored as numbers so they can be filtered/aggregated numerically
    start_year: { type: Number, default: null, index: true },
    end_year: { type: Number, default: null, index: true },

    // Dates - well populated (>99%), parsed from source strings at seed time
    added: { type: Date, default: null },
    published: { type: Date, default: null },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index to support the most common combined filter (sector + country)
insightSchema.index({ sector: 1, country: 1 });

const Insight = mongoose.model("Insight", insightSchema);

export default Insight;
