'use client';

import { useEffect, useRef } from 'react';

interface HolographicLeaderboardProps {
  entries: { rank: number; username: string; score: number; team_name?: string | null }[];
}

export default function HolographicLeaderboard({ entries }: HolographicLeaderboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      container.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full transition-transform duration-200 ease-out"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/5 to-transparent rounded-lg pointer-events-none" />
      {entries.map((entry, idx) => (
        <div
          key={entry.rank}
          className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 cyber-card mb-2 gap-2"
          style={{
            animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`,
            transform: `translateZ(${10 - idx}px)`,
          }}
        >
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className={`font-cyber text-base sm:text-lg w-6 sm:w-8 flex-shrink-0 ${
              entry.rank === 1 ? 'text-yellow-400' :
              entry.rank === 2 ? 'text-gray-300' :
              entry.rank === 3 ? 'text-amber-600' :
              'text-cyber-blue'
            }`}>
              #{entry.rank}
            </span>
            <div className="min-w-0">
              <span className="text-white font-mono text-sm sm:text-base truncate block">{entry.username}</span>
              {entry.team_name && (
                <span className="text-cyber-purple text-xs ml-2">[{entry.team_name}]</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="h-2 w-16 sm:w-24 bg-cyber-dark rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (entry.score / (entries[0]?.score || 1)) * 100)}%` }}
              />
            </div>
            <span className="font-cyber text-cyber-green text-sm sm:text-base whitespace-nowrap">{entry.score} pts</span>
          </div>
        </div>
      ))}
    </div>
  );
}
