import React from 'react';

interface PieSlice {
  value: number;
  color: string;
  label?: string;
}

interface PieChartProps {
  slices: PieSlice[];
  size?: number;
}

export function PieChart({ slices, size = 120 }: PieChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (total < 0.01) {
    return null;
  }

  const nonZeroSlices = slices.filter(slice => slice.value > 0.01);

  if (nonZeroSlices.length === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={nonZeroSlices[0].color}
          stroke="white"
          strokeWidth="1"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[8px] font-bold fill-white"
          style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
        >
          100%
        </text>
      </svg>
    );
  }

  let currentAngle = -90;
  const paths: Array<{ path: string; color: string; percentage: number; midAngle: number }> = [];

  slices.forEach(slice => {
    const percentage = (slice.value / total) * 100;
    const sweepAngle = (slice.value / total) * 360;

    if (percentage > 0.1) {
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweepAngle;

      const startX = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
      const startY = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
      const endX = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
      const endY = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);

      const largeArc = sweepAngle > 180 ? 1 : 0;

      const path = [
        `M 50 50`,
        `L ${startX} ${startY}`,
        `A 45 45 0 ${largeArc} 1 ${endX} ${endY}`,
        `Z`
      ].join(' ');

      const midAngle = startAngle + sweepAngle / 2;

      paths.push({ path, color: slice.color, percentage, midAngle });
      currentAngle = endAngle;
    }
  });

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {paths.map((pathData, index) => (
        <g key={index}>
          <path
            d={pathData.path}
            fill={pathData.color}
            stroke="white"
            strokeWidth="1"
          />
          <text
            x={50 + 30 * Math.cos((pathData.midAngle * Math.PI) / 180)}
            y={50 + 30 * Math.sin((pathData.midAngle * Math.PI) / 180)}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[8px] font-bold fill-white"
            style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
          >
            {pathData.percentage.toFixed(0)}%
          </text>
        </g>
      ))}
    </svg>
  );
}
