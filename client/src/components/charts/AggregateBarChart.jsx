import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { fetchAggregate } from "../../api/insights.js";
import { useFetch } from "../../hooks/useFetch.js";
import ChartPanel from "../ChartPanel.jsx";
import { tooltipStyle, axisStyle, } from "./chartTheme.js";
import { CHART_COLORS } from "../../utils/format.js";

/**
 * Reusable horizontal bar chart for any categorical field (topic, sector,
 * country, region). Always ranked by count, capped to `topN` so
 * high-cardinality fields (topic has 97 unique values) stay readable.
 *
 * A "Not Specified" bar is included for fields where the backend buckets
 * missing values (topic/sector/region/pestle) - it is NOT included for
 * country, where the backend excludes missing values entirely (see
 * server/controllers/insightController.js for the reasoning).
 */
export default function AggregateBarChart({ title, question, groupBy, filters, topN = 12 }) {
  const { data, loading, error } = useFetch(
    () => fetchAggregate(groupBy, "count", filters),
    [groupBy, JSON.stringify(filters)]
  );

  const chartData = (data || []).slice(0, topN);

  return (
    <ChartPanel title={title} question={question} loading={loading} error={error} isEmpty={data && data.length === 0}>
      <ResponsiveContainer width="100%" height={Math.max(260, chartData.length * 26)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 20, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="#232E3B" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" {...axisStyle} />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{ fill: "#8B96A5", fontSize: 11 }}
            stroke="#232E3B"
          />
          <Tooltip {...tooltipStyle} formatter={(v) => [v, "Insights"]} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={entry.label}
                fill={entry.label === "Not Specified" ? "#3A4655" : CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
