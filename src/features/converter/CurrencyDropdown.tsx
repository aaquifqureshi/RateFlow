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
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [, setSearchBuffer] = useState("");
  const bufferTimer = useRef<number | null>(null);

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

  useEffect(() => {
    if (open) {
      const idx = options.indexOf(value);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  }, [open, options, value]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex, open]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open && (e.key === "Enter" || e.key === "ArrowDown")) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) {
          onChange(options[activeIndex]);
          setOpen(false);
        }
        break;

      case "Escape":
        setOpen(false);
        break;

      default: {
        // Type-to-search (A–Z)
        if (/^[a-zA-Z]$/.test(e.key)) {
          const char = e.key.toUpperCase();

          // clear previous timer
          if (bufferTimer.current) {
            window.clearTimeout(bufferTimer.current);
          }

          setSearchBuffer((prev) => {
            const next = (prev + char).slice(0, 3);

            const idx = options.findIndex((opt) => opt.startsWith(next));

            if (idx !== -1) {
              setActiveIndex(idx);

              if (options[idx] === next) {
                onChange(options[idx]);
                setOpen(false);
              }
            }

            return next;
          });

          // reset buffer after delay
          bufferTimer.current = window.setTimeout(() => {
            setSearchBuffer("");
          }, 500);
        }
      }
    }
  }

  return (
    <div ref={rootRef} className={`relative w-30 ${className}`}>
      <button
        type="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className="rounded-full px-2.5 py-1 flex items-center justify-between
                   border border-gray-300 shadow-sm bg-white"
      >
        <div className="flex items-center gap-3 truncate">
          <img
            src={iconPathFor(value)}
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).style.display = "none")
            }
            className="w-6 h-4 rounded-sm"
          />
          <span className="text-sm font-semibold text-gray-900 truncate">
            {value}
          </span>
        </div>

        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute z-50 mt-1 max-h-40 overflow-y-auto
                     bg-white rounded-md text-sm py-1
                     shadow-[0_8px_24px_rgba(0,0,0,0.12)]
                     scrollbar-hide focus:outline-none focus:ring-0"
        >
          {options.map((code, i) => (
            <li
              key={code}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => {
                onChange(code);
                setOpen(false);
              }}
              className={`px-2.5 py-1 flex items-center gap-2 cursor-pointer
                ${activeIndex === i ? "bg-gray-100" : "hover:bg-gray-100"}`}
            >
              <img
                src={iconPathFor(code)}
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.display = "none")
                }
                className="w-6 h-4 rounded-sm"
              />

              <span className="flex-1 truncate">{code}</span>

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
