'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { formatDuration } from '@/lib/calculations';

interface RestTimerProps {
  duration?: number; // secondes
  onDone?: () => void;
  onClose?: () => void;
}

export default function RestTimer({ duration = 90, onDone, onClose }: RestTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          // Vibration
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          onDone?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onDone]);

  const progress = ((duration - remaining) / duration) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(duration);
    setRunning(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-auto mb-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 text-sm font-medium uppercase tracking-widest">
            Repos
          </span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Circular progress */}
        <div className="flex items-center justify-center my-4">
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              {/* Track */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#27272a"
                strokeWidth="8"
              />
              {/* Progress */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={remaining === 0 ? '#22c55e' : '#3b82f6'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-4xl font-bold tabular-nums ${
                  remaining === 0 ? 'text-green-400' : 'text-white'
                }`}
              >
                {remaining === 0 ? '✓' : formatDuration(remaining)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors"
          >
            <RotateCcw size={16} />
            Relancer
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors"
          >
            Passer
          </button>
        </div>
      </div>
    </div>
  );
}
