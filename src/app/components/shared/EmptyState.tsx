import { motion } from "motion/react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#f0f4f8] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#c8d3de]" />
      </div>
      <p className="text-sm" style={{ fontWeight: 500 }}>{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#e8eef5]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[#e8eef5] rounded w-3/4" />
            <div className="h-2.5 bg-[#f0f4f8] rounded w-1/2" />
          </div>
          <div className="h-6 bg-[#e8eef5] rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-border">
          <div className="w-10 h-10 rounded-xl bg-[#e8eef5] mb-3" />
          <div className="h-6 bg-[#e8eef5] rounded w-16 mb-1" />
          <div className="h-3 bg-[#f0f4f8] rounded w-24" />
        </div>
      ))}
    </div>
  );
}
