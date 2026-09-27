import React from 'react';

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3 animate-pulse">
      <div className="h-4 bg-neutral-800 rounded w-1/3" />
      <div className="h-3 bg-neutral-800/70 rounded w-3/4" />
      <div className="h-3 bg-neutral-800/50 rounded w-1/2" />
      {rows > 3 && (
        <div className="flex gap-2 pt-2">
          <div className="h-5 bg-neutral-800 rounded w-16" />
          <div className="h-5 bg-neutral-800 rounded w-20" />
        </div>
      )}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/60 animate-pulse">
      <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-neutral-800 rounded w-20" />
        ))}
      </div>
      <div className="divide-y divide-neutral-800/40">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-12 px-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-3.5 bg-neutral-800/60 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
