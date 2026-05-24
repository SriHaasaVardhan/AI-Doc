export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-zinc-200">DocuGen AI</span>
        </div>
        
        <p className="text-zinc-500 text-sm">
          Built for hackathons with <span className="text-red-500">❤️</span>
        </p>

        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
