import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type DoughnutChartProps = {
  labels: string[];
  values: number[];
};

function DoughnutChart({ labels, values }: DoughnutChartProps) {
  const money = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  return (
    <div className="col-12 col-lg-6">
      <div className="panel p-3 p-md-4 h-100">
        <h3 className="chart-title mb-2">By Category</h3>
        {values.length > 0 ? (
          <Doughnut
            data={{
              labels,
              datasets: [
                {
                  data: values,
                  backgroundColor: ["#38bdf8", "#a78bfa", "#22c55e", "#f59e0b", "#fb7185"],
                  borderColor: "#0f172a",
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const label = ctx.label ? `${ctx.label}: ` : "";
                      return `${label}${money.format(Number(ctx.raw ?? 0))}`;
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

export default DoughnutChart;
