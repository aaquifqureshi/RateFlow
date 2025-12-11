interface DividerProps {
  orientation?: "horizontal" | "vertical";
  length?: string;
  thickness?: string;
  color?: string;
  className?: string;
}

export default function Divider({
  orientation = "horizontal",
  length = "100%",
  thickness = "1px",
  color = "bg-gray-500",
  className = "",
}: DividerProps) {
  const isVertical = orientation === "vertical";

  const isTailwind = color.startsWith("bg-");

  return (
    <div
      className={`
        ${isVertical ? "w-px" : "h-px"}
        ${isTailwind ? color : ""}
        ${className}
      `}
      style={{
        width: isVertical ? thickness : length,
        height: isVertical ? length : thickness,
        backgroundColor: !isTailwind ? color : undefined,
      }}
    />
  );
}
