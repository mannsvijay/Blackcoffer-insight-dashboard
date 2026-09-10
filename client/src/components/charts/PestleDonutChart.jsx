import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchAggregate } from "../../api/insights.js";
import { useFetch } from "../../hooks/useFetch.js";
import ChartPanel from "../ChartPanel.jsx";
import { tooltipStyle } from "./chartTheme.js";
import { CHART_COLORS } from "../../utils/format.js";

/**
 * Question answered: "What share of insights fall under each PESTLE
 * category?" 9.3% of records have no PESTLE value - shown as its own
 * "Not Specified" slice rather than hidden, since at that share it's
 * informative in its own right.
 */
export default function PestleDonutChart({ filters }) {
  const { data, loading, error } = useFetch(
    () => fetchAggregate("pestle", "count", filters),
    [JSON.stringify(filters)]
  );

  return (
    <ChartPanel
      title="PESTLE distribution"
      question="Share of insights by PESTLE category"
      loading={loading}
      error={error}
      isEmpty={data && data.length === 0}
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data || []}
            dataKey="count"
            nameKey="label"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {(data || []).map((entry, i) => (
              <Cell
                key={entry.label}
                fill={entry.label === "Not Specified" ? "#3A4655" : CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(v, n) => [v, n]} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#8B96A5" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
