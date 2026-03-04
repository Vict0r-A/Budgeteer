import { CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

type PieChartProps = {
  labels: string[];
  values: number[];
};

function PieChart({ labels, values }: PieChartProps) {
  const money = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  return (
    <div className="col-12 col-lg-6">
      <div className="panel p-3 p-md-4 h-100">
        <h3 className="chart-title mb-2">Spending Over Time</h3>
        {values.length > 0 ? (
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "Spending",
                  data: values,
                  borderColor: "#38bdf8",
                  backgroundColor: "rgba(56, 189, 248, 0.2)",
                  fill: true,
                  tension: 0.3,
                },
              ],
            }}
            options={{
              scales: {
                y: {
                  ticks: {
                    callback: (value) => money.format(Number(value)),
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const label = ctx.dataset.label ? `${ctx.dataset.label}: ` : "";
                      return `${label}${money.format(Number(ctx.parsed.y ?? 0))}`;
                    },
                  },
                },
              },
            }}
          />
        ) : (
          <div className="chart-placeholder">No expenses available in this period.</div>
        )}
      </div>
    </div>
  );
}

export default PieChart;
