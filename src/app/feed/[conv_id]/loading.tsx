export default function GhostDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-4 md:px-6 md:pt-8">
      <div className="shimmer mb-4 h-4 w-32 rounded" />
      <div className="shimmer mb-8 h-[180px] rounded-lg" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div className="shimmer h-12 w-2/3 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
