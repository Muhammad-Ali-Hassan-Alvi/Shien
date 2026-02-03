export default function ProductSkeleton() {
  return (
    <div className="group relative flex flex-col gap-2 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-200 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
      </div>

      {/* Content Skeleton */}
      <div className="px-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
}
