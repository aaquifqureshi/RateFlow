// src/hooks/currencyHistory.ts
import { useEffect, useState } from "react";
import { isoDate } from "./graphUtils";

export type HistoryRow = {
  date: string;
} & Record<string, number>;

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

    // same currency → flat 1 (this is fine)
    if (from === to) {
      const rows: HistoryRow[] = [];
      const end = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        rows.push({ date: isoDate(d), [to]: 1 } as HistoryRow);
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

        // overfetch to cover weekends/holidays
        start.setDate(end.getDate() - days * 2);

        const url = `https://api.frankfurter.app/${isoDate(start)}..${isoDate(
          end
        )}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

        setLastUrl(url);

        const res = await fetch(url);
        if (!res.ok) {
          setHistory([]);
          setErrorMessage(
            "Live conversion is available for this currency pair, but historical trends are not available for all currencies.Switch to a widely traded currency (USD, EUR, INR, GBP, JPY) to view the chart."
          );
          return;
        }

        const json = await res.json();
        if (!json || typeof json !== "object" || !json.rates) {
          setHistory([]);
          setErrorMessage(
            "Live conversion is available for this currency pair, but historical trends are not available for all currencies.Switch to a widely traded currency (USD, EUR, INR, GBP, JPY) to view the chart."
          );
          return;
        }

        const rates = json.rates as Record<string, Record<string, number>>;

        // build ONLY from actual trading days
        const rows: HistoryRow[] = Object.keys(rates)
          .sort()
          .map((date) => ({
            date,
            [to]: rates[date][to],
          }));

        const sliced = rows.slice(-days);

        if (!cancelled) {
          setHistory(sliced);
          setErrorMessage(null);
        }
      } catch (err) {
        console.error("[useCurrencyHistory] error", err);
        if (!cancelled) {
          setHistory([]);
          setErrorMessage("Failed to fetch historical data.");
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
