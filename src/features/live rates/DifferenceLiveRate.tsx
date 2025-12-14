import { useEffect, useState } from "react";

type Props = {
  base: string;
  target: string;
};

type RateState = {
  current: number | null;
  previous: number | null;
  delta: number | null;
  percent: number | null;
  loading: boolean;
  error: boolean;
};

export function DifferenceLiveRate({ base, target }: Props) {
  const [state, setState] = useState<RateState>({
    current: null,
    previous: null,
    delta: null,
    percent: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchRates() {
      try {
        setState((s) => ({ ...s, loading: true, error: false }));

        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 5);

        const url = `https://api.frankfurter.app/${start
          .toISOString()
          .slice(0, 10)}..${end
          .toISOString()
          .slice(0, 10)}?from=${base}&to=${target}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");

        const json = await res.json();
        const rates = json?.rates as Record<string, Record<string, number>>;

        const dates = Object.keys(rates).sort();

        if (dates.length < 2) {
          if (!cancelled) {
            setState({
              current: null,
              previous: null,
              delta: null,
              percent: null,
              loading: false,
              error: false,
            });
          }
          return;
        }

        const prev = rates[dates[dates.length - 2]][target];
        const curr = rates[dates[dates.length - 1]][target];

        const delta = curr - prev;
        const percent = (delta / prev) * 100;

        if (!cancelled) {
          setState({
            current: curr,
            previous: prev,
            delta,
            percent,
            loading: false,
            error: false,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            current: null,
            previous: null,
            delta: null,
            percent: null,
            loading: false,
            error: true,
          });
        }
      }
    }

    fetchRates();
    return () => {
      cancelled = true;
    };
  }, [base, target]);

  if (state.loading) {
    return <div className="text-sm text-gray-400">Loading…</div>;
  }

  if (state.error || state.delta === null || state.percent === null) {
    return <div className="text-sm text-gray-400">—</div>;
  }

  const isUp = state.delta > 0;
  const isDown = state.delta < 0;

  const color = isUp
    ? "text-green-600"
    : isDown
    ? "text-red-600"
    : "text-gray-500";

  const arrow = isUp ? "↑" : isDown ? "↓" : "—";

  return (
    <div className={`text-sm font-medium ${color}`}>
      {arrow} {Math.abs(state.delta).toFixed(4)}{" "}
      <span className="text-xs">
        ({state.percent > 0 ? "+" : ""}
        {state.percent.toFixed(2)}%)
      </span>
    </div>
  );
}
