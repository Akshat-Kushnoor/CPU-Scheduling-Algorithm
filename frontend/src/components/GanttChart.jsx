import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GanttChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Run a simulation to see the Gantt chart.
      </div>
    );
  }

  // Convert your real data into Recharts format
  const chartData = data.map((segment) => ({
    process: segment.processId,
    start: segment.start,
    duration: (segment.end ?? 0) - (segment.start ?? 0),
    label: segment.processId,
  }));

  const minStart = Math.min(...data.map((s) => s.start));
  const maxEnd = Math.max(...data.map((s) => s.end));

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
        Gantt Chart
      </h3>

      <ResponsiveContainer width="100%" height={150}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
        >
          <YAxis
            dataKey="label"
            type="category"
            width={60}
            tick={{ fill: "#9ca3af" }} // gray-400
          />

          <XAxis
            type="number"
            domain={[minStart, maxEnd]}
            tick={{ fill: "#9ca3af" }}
          />

          <Tooltip
            contentStyle={{
              background: "#1f2937",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
            }}
            formatter={(value, name, payload) => {
              const start = payload.payload.start;
              const end = start + payload.payload.duration;
              return [`${start} → ${end}`, "Time"];
            }}
            labelFormatter={(label) => `Process: ${label}`}
          />

          <Bar
            dataKey="duration"
            stackId="timeline"
            isAnimationActive={true}
            radius={[4, 4, 4, 4]}
            fill="#60a5fa" // Tailwind blue-400
          >
            <LabelList
              dataKey="label"
              position="insideLeft"
              fill="#ffffff"
              style={{ fontSize: "10px" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-2">
        <span>Start: {minStart}</span>
        <span>End: {maxEnd}</span>
        <span>Total: {maxEnd - minStart}</span>
      </div>
    </div>
  );
};

export default GanttChart;
