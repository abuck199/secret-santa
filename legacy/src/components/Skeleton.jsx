import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

// Matches the Dashboard layout so loading doesn't shift the page.
export function DashboardSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="card p-6 sm:p-7 mb-10 flex items-center gap-5">
        <Skeleton className="w-[84px] h-[84px] !rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      <div className="card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line mb-10 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-5 sm:p-6 space-y-2.5">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      <Skeleton className="h-7 w-48 mb-4 !rounded-xl" />
      <div className="card divide-y divide-line overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 sm:px-6 py-4">
            <Skeleton className="w-11 h-11 !rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
