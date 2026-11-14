import React from 'react';

export default function ProgressBar({ value = 0, size = 'md', showLabel = true }) {
  const clampedValue = Math.min(Math.max(Math.round(value), 0), 100);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className="w-full">
      <div className="w-full bg-charcoal-100 rounded-full overflow-hidden">
        <div
          className={`${heightClasses[size] || heightClasses.md} bg-lime rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1 text-xs">
          <span className="text-charcoal-400 font-medium">Progress</span>
          <span className="font-bold text-charcoal">{clampedValue}%</span>
        </div>
      )}
    </div>
  );
}
