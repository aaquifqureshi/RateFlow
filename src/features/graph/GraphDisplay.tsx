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

  // hook handles fetching + forward-fill + swap/invert fallback
  const { history, fetching, lastUrl, errorMessage } = useCurrencyHistory(
    from,
    to,
    days
  );

  const chartData = useMemo(() => sortHistory(history), [history]);

  const [minVal, maxVal] = useMemo(
    () => computeMinMax(chartData, to),
    [chartData, to]
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
        onChange={(e) => setTimeframe(e.target.value as "7d" | "15d" | "30d")}
        className="border rounded px-2 py-1 text-sm"
        aria-label="Select timeframe"
      >
        <option value="7d">7d</option>
        <option value="15d">15d</option>
        <option value="30d">30d</option>
      </select>
    </div>
  );

  return (
    <div className="p-4 flex justify-center">
      <div style={{ width: "100%", maxWidth: 820 }}>
        <Card
          size="lg"
          title={headerTitle}
          headerRight={headerRight}
          as="section"
        >
          {/* Chart area */}
          {fetching || loading ? (
            <div className="py-16 text-center">Loading chart…</div>
          ) : chartData.length === 0 ? (
            <div className="py-6 text-center">
              <div className="mb-2">No data.</div>
              {errorMessage && (
                <div className="text-sm text-red-500 mb-2">{errorMessage}</div>
              )}
              {lastUrl && (
                <div className="text-xs text-gray-600 wrap-break-word">
                  Last request: <code>{lastUrl}</code>
                  <div className="mt-1 text-xs">
                    Open this URL in a browser to inspect the raw JSON.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ width: "100%", height: 360 }}>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart
                  data={chartData}
                  margin={{ left: 0, right: 16, top: 8, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    ticks={xTicks.length ? xTicks : undefined}
                    tickFormatter={formatDDMM}
                    height={40}
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
                      Math.abs(v) >= 1
                        ? Number(v.toFixed(4)).toString()
                        : Number(v.toFixed(6)).toString()
                    }
                    width={80}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: `${to} per 1 ${from}`,
                      angle: -90,
                      position: "insideLeft",
                      offset: -8,
                    }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                  <Line
                    type="monotone"
                    dataKey={to}
                    stroke="#3b82f6"
                    dot={{ r: 3 }}
                    strokeWidth={2}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
