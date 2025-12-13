import React, { type JSX } from "react";

type Size = "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  size?: Size;
  title?: React.ReactNode;
  headerRight?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  clickable?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

const sizeMap: Record<Size, string> = {
  sm: "p-3 text-sm",
  md: "p-4 text-base",
  lg: "p-6 text-base",
};

export default function Card({
  children,
  className = "",
  size = "md",
  title,
  headerRight,
  as = "div",
  clickable = false,
  onClick,
  ...rest
}: CardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = as as any;

  return (
    <Tag
      className={[
        "bg-white rounded-lg border border-gray-100 shadow-sm",
        sizeMap[size],
        clickable
          ? "cursor-pointer hover:shadow-md hover:border-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          : "",
        className,
      ].join(" ")}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...rest}
    >
      {(title || headerRight) && (
        <div className="flex items-start justify-between mb-3">
          <div className="font-medium text-gray-700">{title}</div>
          {headerRight && <div className="ml-4">{headerRight}</div>}
        </div>
      )}

      {children}
    </Tag>
  );
}
