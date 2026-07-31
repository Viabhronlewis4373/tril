export function MapPlaceholder() {
  return (
    <div className="absolute inset-0 bg-slate-100 overflow-hidden">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #94a3b8 1px, transparent 1px),
            linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Center point */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500/50 border-2 border-blue-600 flex items-center justify-center">
        <div className="w-1 h-1 bg-blue-800 rounded-full"></div>
      </div>
    </div>
  );
}
