import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchTimeseries } from "../../api/insights.js";
import { useFetch } from "../../hooks/useFetch.js";
import ChartPanel from "../ChartPanel.jsx";
import { tooltipStyle, axisStyle } from "./chartTheme.js";

/**
 * Question answered: "How does average intensity trend across the years
 * insights apply to?"
 * X = start_year, Y = average intensity.
 * Uses start_year specifically (not end_year or published) because it best
 * represents the year an insight is about. Only ~31% of records have a
 * start_year - records without one are excluded, not defaulted to 0.
 */
export default function IntensityTrendChart({ filters }) {
  const { data, loading, error } = useFetch(
    () => fetchTimeseries("start_year", filters),
    [JSON.stringify(filters)]
  );

  return (
    <ChartPanel
      title="Intensity by year"
      question="Average intensity of insights, by the year they apply to (start_year)"
      loading={loading}
      error={error}
      isEmpty={data && data.length === 0}
      wide
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data || []} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#232E3B" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axisStyle} />
          <YAxis {...axisStyle} width={36} />
          <Tooltip {...tooltipStyle} formatter={(v) => [v, "Avg intensity"]} />
          <Line type="monotone" dataKey="avgIntensity" stroke="#E3A857" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
