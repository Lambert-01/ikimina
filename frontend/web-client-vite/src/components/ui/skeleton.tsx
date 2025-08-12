import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton component for loading states
 * Use this to indicate loading state for any content
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

/**
 * SkeletonText component for text loading states with a more realistic text appearance
 */
export function SkeletonText({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array(lines).fill(0).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4", 
            i === lines - 1 && lines > 1 ? "w-4/5" : "w-full"
          )} 
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard component for card loading states
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 dark:border-gray-800 p-4", className)}>
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <SkeletonText lines={3} />
        <div className="flex justify-between pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonAvatar component for avatar loading states
 */
export function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

/**
 * SkeletonButton component for button loading states
 */
export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-20 rounded-md", className)} />;
}

/**
 * SkeletonTable component for table loading states
 */
export function SkeletonTable({ rows = 5, columns = 3, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex space-x-4">
        {Array(columns).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      <div className="space-y-2">
        {Array(rows).fill(0).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array(columns).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-12 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 