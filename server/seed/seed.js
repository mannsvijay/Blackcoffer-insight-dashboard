import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Insight from "../models/Insight.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "..", "data", "jsondata.json");

/**
 * Converts "" -> null, and casts numeric-looking values to Number.
 * Never invents a value: if the source is empty, the result is null.
 */
function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function toNullableString(value) {
  if (value === "" || value === null || value === undefined) return null;
  return String(value).trim();
}

/**
 * The source dates look like "January, 20 2017 03:51:25".
 * JS's Date constructor parses this correctly, but we still guard against
 * unparseable values rather than trusting every record blindly.
 */
function toNullableDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function transformRecord(raw) {
  return {
    title: raw.title ?? "",
    insight: raw.insight ?? "",
    url: raw.url ?? "",

    sector: toNullableString(raw.sector),
    topic: toNullableString(raw.topic),
    region: toNullableString(raw.region),
    country: toNullableString(raw.country),
    pestle: toNullableString(raw.pestle),
    source: toNullableString(raw.source),

    intensity: toNullableNumber(raw.intensity),
    likelihood: toNullableNumber(raw.likelihood),
    relevance: toNullableNumber(raw.relevance),
    impact: toNullableNumber(raw.impact),

    start_year: toNullableNumber(raw.start_year),
    end_year: toNullableNumber(raw.end_year),

    added: toNullableDate(raw.added),
    published: toNullableDate(raw.published),
  };
}

async function seed() {
  await connectDB();

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Could not find dataset at ${DATA_PATH}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  if (!Array.isArray(raw)) {
    console.error("Expected jsondata.json to contain a top-level array of records.");
    process.exit(1);
  }

  const docs = raw.map(transformRecord);

  const existingCount = await Insight.countDocuments();
  if (existingCount > 0) {
    console.log(
      `Collection already has ${existingCount} documents. Clearing before re-seeding to avoid duplicate imports.`
    );
    await Insight.deleteMany({});
  }

  const inserted = await Insight.insertMany(docs, { ordered: false });
  console.log(`Seed complete: inserted ${inserted.length} of ${raw.length} records.`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
