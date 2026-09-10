import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchTimeseries } from "../../api/insights.js";
import { useFetch } from "../../hooks/useFetch.js";
import ChartPanel from "../ChartPanel.jsx";
import { tooltipStyle, axisStyle } from "./chartTheme.js";

/**
 * Question answered: "How much insight volume came in over time?"
 * X = added month, Y = record count.
 * Uses the `added` field deliberately (99.9% populated) rather than
 * start_year/end_year (69-74% missing) so this is the one temporal chart
 * that honestly reflects the entire dataset, not just the subset with a
 * defined start/end year.
 */
export default function VolumeOverTimeChart({ filters }) {
  const { data, loading, error } = useFetch(
    () => fetchTimeseries("added", filters),
    [JSON.stringify(filters)]
  );

  return (
    <ChartPanel
      title="Insights volume over time"
      question="Number of insights added per month (added date, ~100% of records have this)"
      loading={loading}
      error={error}
      isEmpty={data && data.length === 0}
      wide
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data || []} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3FBFAA" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#3FBFAA" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#232E3B" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axisStyle} minTickGap={20} />
          <YAxis {...axisStyle} width={36} />
          <Tooltip {...tooltipStyle} formatter={(v) => [v, "Insights added"]} />
          <Area type="monotone" dataKey="count" stroke="#3FBFAA" fill="url(#volumeFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
