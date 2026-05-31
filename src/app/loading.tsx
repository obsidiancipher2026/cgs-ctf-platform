export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-mono text-sm">Loading...</p>
      </div>
    </div>
  );
}
