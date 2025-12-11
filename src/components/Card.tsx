import React, { type JSX } from "react";

type Size = "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  size?: Size;
  title?: React.ReactNode;
  headerRight?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
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
  ...rest
}: CardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = as as any;
  return (
    <Tag
      className={[
        "bg-white rounded-lg shadow-sm border border-gray-100",
        sizeMap[size],
        className,
      ].join(" ")}
      {...rest}
    >
      {title || headerRight ? (
        <div className="flex items-start justify-between mb-3">
          <div className="font-medium text-gray-700">{title}</div>
          {headerRight ? <div className="ml-4">{headerRight}</div> : null}
        </div>
      ) : null}

      <div>{children}</div>
    </Tag>
  );
}
