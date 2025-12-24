interface FieldLayoutProps {
  aspectRatio?: number; // width / height
  lineColor?: string;
  grassLight?: string;
  grassDark?: string;
  lineWidth?: number;
  children: React.ReactElement;
}

const FieldLayout = ({
  aspectRatio = 105 / 68,
  lineColor = "#ffffff",
  grassLight = "#1e6f40",
  lineWidth = 2,
  children,
}: FieldLayoutProps) => {
  // Pitch dimensions
  const W = 1050;
  const H = 680;

  const centerX = W / 2;
  const centerY = H / 2;

  const penaltyBoxWidth = 165;
  const penaltyBoxHeight = 403;
  const goalBoxWidth = 55;
  const goalBoxHeight = 183;

  const penaltySpotDistance = 110;
  const circleRadius = 91.5;

  return (
    <div className="relative w-full overflow-visible bg-primary">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "auto",
          aspectRatio,
          display: "block",
        }}
      >
        <defs>
          {/* Clip paths for penalty arcs */}
          <clipPath id="leftArcClip">
            <rect x={penaltyBoxWidth} y={0} width={W} height={H} />
          </clipPath>
          <clipPath id="rightArcClip">
            <rect x={0} y={0} width={W - penaltyBoxWidth} height={H} />
          </clipPath>
        </defs>

        {/* Grass (single color) */}
        <rect width={W} height={H} fill={grassLight} />

        {/* Outer boundary */}
        <rect
          x={lineWidth / 2}
          y={lineWidth / 2}
          width={W - lineWidth}
          height={H - lineWidth}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          opacity={0.3}
        />

        {/* Halfway line */}
        <line
          x1={centerX}
          y1={lineWidth}
          x2={centerX}
          y2={H - lineWidth}
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          opacity={0.3}
        />

        {/* Center circle & spot */}
        <circle
          cx={centerX}
          cy={centerY}
          r={circleRadius}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          opacity={0.3}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={3}
          fill={lineColor}
          opacity={0.3}
        />

        {/* Penalty areas */}
        <rect
          x={0}
          y={(H - penaltyBoxHeight) / 2}
          width={penaltyBoxWidth}
          height={penaltyBoxHeight}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          opacity={0.3}
        />
        <rect
          x={W - penaltyBoxWidth}
          y={(H - penaltyBoxHeight) / 2}
          width={penaltyBoxWidth}
          height={penaltyBoxHeight}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          opacity={0.3}
        />

        {/* Goal areas */}
        <rect
          x={0}
          y={(H - goalBoxHeight) / 2}
          width={goalBoxWidth}
          height={goalBoxHeight}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          opacity={0.3}
        />
        <rect
          x={W - goalBoxWidth}
          y={(H - goalBoxHeight) / 2}
          width={goalBoxWidth}
          height={goalBoxHeight}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          opacity={0.3}
        />

        {/* Penalty spots */}
        <circle
          cx={penaltySpotDistance}
          cy={centerY}
          r={3}
          fill={lineColor}
          opacity={0.3}
        />
        <circle
          cx={W - penaltySpotDistance}
          cy={centerY}
          r={3}
          fill={lineColor}
          opacity={0.3}
        />

        {/* Penalty arcs (outside box only) */}
        <path
          d={`M ${penaltySpotDistance} ${centerY - circleRadius}
      A ${circleRadius} ${circleRadius} 0 0 1
        ${penaltySpotDistance} ${centerY + circleRadius}`}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          clipPath="url(#leftArcClip)"
          opacity={0.3}
        />

        <path
          d={`M ${W - penaltySpotDistance} ${centerY - circleRadius}
      A ${circleRadius} ${circleRadius} 0 0 0
        ${W - penaltySpotDistance} ${centerY + circleRadius}`}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
          clipPath="url(#rightArcClip)"
          opacity={0.3}
        />
      </svg>
      <div className="absolute inset-0 z-20 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default FieldLayout;
