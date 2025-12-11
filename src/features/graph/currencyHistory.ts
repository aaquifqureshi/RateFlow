// src/hooks/currencyHistory.ts — custom hook that fetches and forward-fills history
import { useEffect, useState } from "react";
import { isoDate, dateRange } from "./graphUtils";

export type HistoryRow = { date: string; [currency: string]: number };

export default function useCurrencyHistory(
  from: string,
  to: string,
  days: number
): {
  history: HistoryRow[];
  fetching: boolean;
  lastUrl: string | null;
  errorMessage: string | null;
} {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [fetching, setFetching] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) {
      setHistory([]);
      setErrorMessage(null);
      return;
    }

    // trivial same-currency -> flat 1s
    if (from === to) {
      const rows: HistoryRow[] = [];
      const end = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(end.getDate() - i);
        rows.push({ date: isoDate(d), [to]: 1 });
      }
      setHistory(rows);
      setErrorMessage(null);
      return;
    }

    let cancelled = false;

    async function fetchHistory(): Promise<void> {
      setFetching(true);
      setErrorMessage(null);

      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        const fmt = isoDate;

        const frankUrl = `https://api.frankfurter.app/${fmt(start)}..${fmt(
          end
        )}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

        setLastUrl(frankUrl);
        const res = await fetch(frankUrl);
        if (!res.ok) {
          setHistory([]);
          setErrorMessage(`Fallback API returned HTTP ${res.status}`);
          return;
        }
        const frankJson = await res.json();
        if (
          !frankJson ||
          typeof frankJson !== "object" ||
          !("rates" in frankJson)
        ) {
          setHistory([]);
          setErrorMessage("Fallback API returned no data.");
          return;
        }

        const frankRates = (frankJson as any).rates as Record<
          string,
          Record<string, number>
        >;
        const map = new Map<string, number>();
        Object.keys(frankRates).forEach((d) => {
          const v = frankRates[d]?.[to];
          map.set(d, typeof v === "number" ? v : Number(v) || 0);
        });

        const allDates = dateRange(fmt(start), fmt(end));
        const filledRows: HistoryRow[] = [];
        let lastKnown: number | null = null;
        allDates.forEach((d) => {
          if (map.has(d)) {
            lastKnown = map.get(d)!;
            filledRows.push({ date: d, [to]: lastKnown });
          } else {
            filledRows.push({ date: d, [to]: lastKnown ?? 0 });
          }
        });

        const meaningful = filledRows.some((r) => (r[to] ?? 0) !== 0);
        if (!meaningful) {
          // try swapped/inversion fallback
          const frankSwappedUrl = `https://api.frankfurter.app/${fmt(
            start
          )}..${fmt(end)}?from=${encodeURIComponent(
            to
          )}&to=${encodeURIComponent(from)}`;
          setLastUrl(frankSwappedUrl);
          const swappedRes = await fetch(frankSwappedUrl);
          if (!swappedRes.ok) {
            setHistory([]);
            setErrorMessage("No historical data available for this pair.");
            return;
          }
          const swappedJson = await swappedRes.json();
          const swappedRates = (swappedJson as any).rates as Record<
            string,
            Record<string, number>
          >;
          const swappedMap = new Map<string, number>();
          Object.keys(swappedRates).forEach((d) => {
            const v = swappedRates[d]?.[from];
            swappedMap.set(d, typeof v === "number" ? v : Number(v) || 0);
          });

          lastKnown = null;
          const inverted: HistoryRow[] = [];
          allDates.forEach((d) => {
            if (swappedMap.has(d)) {
              lastKnown = swappedMap.get(d)!;
              const inv = lastKnown !== 0 ? 1 / lastKnown : 0;
              inverted.push({ date: d, [to]: inv });
            } else {
              const inv =
                lastKnown !== null && lastKnown !== 0 ? 1 / lastKnown : 0;
              inverted.push({ date: d, [to]: inv });
            }
          });

          if (!cancelled) {
            setHistory(inverted);
            setErrorMessage(null);
          }
          return;
        }

        if (!cancelled) {
          setHistory(filledRows);
          setErrorMessage(null);
        }
      } catch (err) {
        console.error("[useCurrencyHistory] fetchHistory error", err);
        if (!cancelled) {
          setHistory([]);
          setErrorMessage("Failed to fetch historical data (see console).");
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [from, to, days]);

  return { history, fetching, lastUrl, errorMessage };
}
