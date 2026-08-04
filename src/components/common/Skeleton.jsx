import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return <div className={`rounded-xl animate-shimmer bg-slate-800/80 ${className}`} />;
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton key={cIdx} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
