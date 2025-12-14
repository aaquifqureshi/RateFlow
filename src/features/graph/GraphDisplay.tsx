import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  sortHistory,
  buildXTicks,
  computeMinMax,
  buildYDomain,
  buildYTicks,
  formatDDMM,
} from "./graphUtils";
import Card from "../../components/Card";
import useCurrencyHistory from "./currencyHistory";

export default function GraphDisplay({
  from,
  to,
  loading,
}: {
  from: string;
  to: string;
  loading: boolean;
}) {
  const [timeframe, setTimeframe] = useState<"7d" | "15d" | "30d">("15d");

  const days = useMemo(() => {
    switch (timeframe) {
      case "7d":
        return 7;
      case "15d":
        return 15;
      case "30d":
      default:
        return 30;
    }
  }, [timeframe]);

  // hook fetches trading-day history only (no fake dates, no forward-fill)
  const { history, fetching, lastUrl, errorMessage } = useCurrencyHistory(
    from,
    to,
    days
  );

  const chartData = useMemo(() => sortHistory(history), [history]);

  const [minVal, maxVal] = useMemo(
    () => computeMinMax(chartData, "value"),
    [chartData]
  );

  const yDomain = useMemo(() => buildYDomain(minVal, maxVal), [minVal, maxVal]);

  const yTicks = useMemo(() => buildYTicks(yDomain, 7), [yDomain]);

  const xTicks = useMemo(
    () =>
      buildXTicks(
        chartData.map((r) => r.date),
        days
      ),
    [chartData, days]
  );

  const headerTitle = (
    <div className="text-sm">
      Showing: <strong>{from}</strong> → <strong>{to}</strong>
    </div>
  );

  const headerRight = (
    <div className="flex items-center gap-3">
      <select
        value={timeframe}
        onChange={(e) => {
          e.preventDefault();
          setTimeframe(e.target.value as "7d" | "15d" | "30d");
        }}
        className="px-2.5 py-1 flex items-center justify-between border border-gray-300 shadow-sm focus:outline-none focus:ring-0 focus:border-gray-300"
        aria-label="Select timeframe"
      >
        <option value="7d">7d</option>
        <option value="15d">15d</option>
        <option value="30d">30d</option>
      </select>
    </div>
  );

  return (
    <div className="pl-10 flex justify-center">
      <div style={{ width: "100%", maxWidth: 820 }}>
        <Card
          size="lg"
          title={headerTitle}
          headerRight={headerRight}
          as="section"
          className="w-178 max-w-200 bg-white rounded-xl shadow-md"
        >
          {fetching || loading ? (
            <div className="py-16 text-center">Loading chart…</div>
          ) : chartData.length < 2 ? (
            <div className="py-6 text-center">
              <div className="mb-2">Not enough data to display chart.</div>
              {errorMessage && (
                <div className="text-sm text-red-500 mb-2">{errorMessage}</div>
              )}
              {lastUrl && (
                <div className="text-xs text-gray-600 wrap-break-word">
                  Last request: <code>{lastUrl}</code>
                </div>
              )}
            </div>
          ) : (
            <div className="h-65 w-full">
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ left: 20, right: 20, top: 8, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      ticks={xTicks.length ? xTicks : undefined}
                      tickFormatter={formatDDMM}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      domain={
                        yDomain
                          ? [Number(yDomain[0]), Number(yDomain[1])]
                          : undefined
                      }
                      ticks={yTicks}
                      tickFormatter={(v) =>
                        Math.abs(v) >= 1 ? v.toFixed(4) : v.toFixed(6)
                      }
                      width={80}
                      tick={{ fontSize: 12 }}
                      label={{
                        value: `${to} per 1 ${from}`,
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend verticalAlign="bottom" />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={to}
                      stroke="#3b82f6"
                      dot={{ r: 3 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
