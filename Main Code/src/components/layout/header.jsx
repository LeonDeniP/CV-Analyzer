function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-white/20 shadow-sm">

      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-500 flex items-center justify-center text-2xl text-white shadow-lg shadow-blue-500/20">📄</div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">CV Analyzer AI</h1>
            <p className="text-sm text-slate-500 font-medium">Smart ATS Resume Scanner</p>
          </div>
        </div>

        {/* CENTER PROFESSIONAL STATS */}
        <div className="hidden xl:flex items-center gap-4">✨ AI Powered Resume Analysis</div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-emerald-700">AI Online</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-semibold text-blue-700">Instant ATS Scan</span>
          </div>
        </div>
      </div>

    </header>
  );
}

export default Header;