export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pt-10">
      <div className="mb-6">
        <div className="shimmer mb-3 h-8 w-56 rounded" />
        <div className="shimmer h-4 w-96 max-w-full rounded" />
      </div>
      <div className="shimmer mb-6 h-14 rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shimmer h-[260px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
