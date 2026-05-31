'use client';

import { Lock, Eye } from 'lucide-react';

export default function AdminDecoyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-[#0a0a1a]">
      <div className="text-center max-w-md">
        <Lock className="w-20 h-20 text-white mx-auto mb-6" />
        <h1 className="font-cyber text-2xl text-white mb-3 tracking-wider font-bold">
          &gt; ACCESS DENIED_
        </h1>
        <p className="font-mono text-white text-sm leading-relaxed mb-6 font-bold">
          There is nothing here, mister.
        </p>
        <div className="flex items-center justify-center gap-2 text-white/60 font-mono text-xs font-bold">
          <Eye className="w-3 h-3" />
          nice try though
        </div>
        <div className="mt-8 border border-gray-700 rounded-lg p-4 bg-gray-800/20">
          <p className="font-mono text-[10px] text-white/40 leading-relaxed font-bold">
            ─────────────────────────────────────────────<br />
            Connection intercepted. Request logged.<br />
            Your IP has been noted.<br />
            ─────────────────────────────────────────────
          </p>
        </div>
      </div>
    </div>
  );
}
