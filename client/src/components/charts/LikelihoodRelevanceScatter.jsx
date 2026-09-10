import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchScatterData } from "../../api/insights.js";
import { useFetch } from "../../hooks/useFetch.js";
import ChartPanel from "../ChartPanel.jsx";
import { tooltipStyle, axisStyle } from "./chartTheme.js";

/**
 * Question answered: "Do more likely insights also tend to be more
 * relevant, and how intense are they?"
 * X = likelihood (1-4), Y = relevance (1-7), bubble size = intensity.
 * Only records with both likelihood and relevance populated are included
 * (>99% of the dataset has both).
 */
export default function LikelihoodRelevanceScatter({ filters }) {
  const { data, loading, error } = useFetch(
    () => fetchScatterData(filters),
    [JSON.stringify(filters)]
  );

  return (
    <ChartPanel
      title="Likelihood vs. relevance"
      question="Each point is one insight; bubble size reflects intensity"
      loading={loading}
      error={error}
      isEmpty={data && data.length === 0}
    >
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#232E3B" strokeDasharray="3 3" />
          <XAxis type="number" dataKey="likelihood" name="Likelihood" domain={[0, 5]} {...axisStyle} />
          <YAxis type="number" dataKey="relevance" name="Relevance" domain={[0, 8]} {...axisStyle} width={30} />
          <ZAxis type="number" dataKey="intensity" range={[30, 260]} name="Intensity" />
          <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3", stroke: "#232E3B" }} />
          <Scatter data={data || []} fill="#E3A857" fillOpacity={0.6} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
