import { useState, useEffect, useRef } from "react";
import { iconPathFor } from "../../components/currencyHelper";

type Props = {
  value: string;
  onChange: (code: string) => void;
  options: string[];
  className?: string;
};

export default function CurrencyDropdown({
  value,
  onChange,
  options,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // simple outside click handler
  useEffect(() => {
    function close(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = value;

  return (
    <div ref={rootRef} className={`relative w-30 ${className}`}>
      <button
        type="button"
        className="rounded-full px-2.5 py-1 flex items-center justify-between border border-gray-300 shadow-sm"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 truncate">
          {/* Icon */}
          <img
            src={iconPathFor(selected)}
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).style.display = "none")
            }
            className="w-6 h-4 rounded-sm"
          />

          {/* Flag + Code */}
          <span className="text-sm font-semibold text-gray-900 truncate">
            {selected}
          </span>
        </div>

        {/* Inline chevron icon */}
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 max-h-60 overflow-auto bg-white shadow-lg border rounded-md text-sm py-1">
          {options.map((code) => (
            <li
              key={code}
              className="px-2.5 py-1 flex items-center gap-3 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onChange(code);
                setOpen(false);
              }}
            >
              <img
                src={iconPathFor(code)}
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.display = "none")
                }
                className="w-6 h-4 rounded-sm"
              />

              <span className="flex-1 truncate">{code}</span>

              {/* Inline check icon */}
              {code === value && (
                <svg
                  className="w-4 h-4 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 10l3 3 7-7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
