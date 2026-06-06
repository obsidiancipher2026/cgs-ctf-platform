'use client';

import { motion } from 'framer-motion';
import { Lock, Eye, Terminal, ShieldAlert, Scan, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDecoyPage() {
  const [scanLine, setScanLine] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);

  const logEntries = [
    'Initializing security scan...',
    'Checking authorization tokens...',
    'WARNING: Unauthorized access attempt detected',
    'Source: ' + (typeof window !== 'undefined' ? window.location.hostname : 'unknown'),
    'Flagging IP address for review...',
    'Alert sent to security team',
    'Connection intercepted. Request logged.',
  ];

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor(v => !v), 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (scanLine >= logEntries.length) return;
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, logEntries[scanLine]]);
      setScanLine(scanLine + 1);
    }, 400 + Math.random() * 600);
    return () => clearTimeout(timer);
  }, [scanLine]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-[#0a0a1a] relative overflow-hidden">
      {/* Scan line overlay */}
      <div
        className="absolute left-0 right-0 h-px bg-cyber-red/30 z-10 pointer-events-none"
        style={{
          top: `${((Date.now() % 4000) / 4000) * 100}%`,
          boxShadow: '0 0 8px rgba(255,0,51,0.3)',
          transition: 'top 0.05s linear',
        }}
      />

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,0,51,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,51,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 text-center max-w-md"
      >
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.03, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <Lock className="w-20 h-20 text-cyber-red/80" />
            <div className="absolute inset-0 w-20 h-20 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-cyber-red/30" />
            </div>
          </div>
        </motion.div>

        <h1 className="font-cyber text-2xl text-cyber-red mb-3 tracking-wider font-bold">
          &gt; ACCESS DENIED{showCursor && '_'}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-mono text-white/50 text-sm leading-relaxed mb-6"
        >
          There is nothing here, mister.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-2 text-cyber-red/40 font-mono text-xs mb-6"
        >
          <Eye className="w-3 h-3" />
          nice try though
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="border border-cyber-red/10 rounded-lg p-4 bg-cyber-red/[0.02] text-left"
        >
          <div className="flex items-center gap-2 mb-2 text-cyber-red/40 font-mono text-[10px]">
            <Terminal className="w-3 h-3" />
            <Scan className="w-3 h-3" />
            <span>security_trace.log</span>
            <Activity className="w-3 h-3 ml-auto animate-pulse" />
          </div>
          <div className="font-mono text-[10px] leading-relaxed space-y-0.5">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={i === 1 ? 'text-cyber-red/70' : i >= 5 ? 'text-cyber-red/50' : 'text-white/40'}
              >
                {'>'} {log}
              </motion.div>
            ))}
            {scanLine < logEntries.length && (
              <span className="text-cyber-red/40 animate-pulse">{'>'} </span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
