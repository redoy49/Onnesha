"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Clock, Play, Pause, RefreshCw, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

interface NextPostCountdownProps {
  scheduleTime?: string; // "HH:MM" e.g. "09:00"
  timezone?: string; // e.g. "UTC"
  isEnabled?: boolean;
  isExecuting?: boolean;
  lastRunAt?: string | null;
  onRunNow?: () => void;
  onToggleSchedule?: () => void;
  compact?: boolean;
}

const FULL_DASH_ARRAY = 283; // 2 * PI * 45 ≈ 282.74

export function NextPostCountdown({
  scheduleTime = "06:00",
  timezone = "Asia/Dhaka",
  isEnabled = true,
  isExecuting = false,
  lastRunAt = null,
  onRunNow,
  onToggleSchedule,
  compact = false,
}: NextPostCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [nextScheduledDateStr, setNextScheduledDateStr] = useState<string>("");

  // Calculate target date and remaining seconds
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const [hoursStr, minutesStr] = (scheduleTime || "06:00").split(":");
      const targetHours = parseInt(hoursStr || "6", 10);
      const targetMinutes = parseInt(minutesStr || "0", 10);

      // Determine target UTC hour:
      // If timezone is Dhaka/BST (UTC+6), 6:00 AM Dhaka is 00:00 UTC
      let targetUtcHour = targetHours;
      if (timezone === "Asia/Dhaka" || timezone === "BST" || timezone === "GMT+6" || timezone === "UTC+6") {
        targetUtcHour = (targetHours - 6 + 24) % 24;
      }

      // Determine target in UTC
      const target = new Date(now);
      target.setUTCHours(targetUtcHour, targetMinutes, 0, 0);

      // If target has already passed today, schedule for tomorrow
      if (target.getTime() <= now.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }

      const diffMs = target.getTime() - now.getTime();
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));

      setSecondsRemaining(diffSec);
      setNextScheduledDateStr(
        target.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: timezone === "Asia/Dhaka" ? "Asia/Dhaka" : undefined,
          timeZoneName: "short",
        })
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [scheduleTime, timezone]);

  // Total daily cycle is 24 hours (86400 seconds)
  const timeFraction = useMemo(() => {
    if (!isEnabled) return 0;
    const fraction = secondsRemaining / 86400;
    return Math.max(0, Math.min(1, fraction));
  }, [secondsRemaining, isEnabled]);

  // Dash array calculation
  const strokeDashoffset = useMemo(() => {
    const val = (timeFraction * FULL_DASH_ARRAY).toFixed(0);
    return `${val} ${FULL_DASH_ARRAY}`;
  }, [timeFraction]);

  // Dynamic Color Category:
  // Green > 2 hours (7200s)
  // Orange: 30 mins to 2 hours (1800s - 7200s)
  // Red: < 30 mins (< 1800s)
  const colorClass = useMemo(() => {
    if (!isEnabled) return "paused";
    if (secondsRemaining > 7200) return "green";
    if (secondsRemaining > 1800) return "orange";
    return "red";
  }, [secondsRemaining, isEnabled]);

  // Format HH:MM:SS
  const formattedTime = useMemo(() => {
    const h = Math.floor(secondsRemaining / 3600);
    const m = Math.floor((secondsRemaining % 3600) / 60);
    const s = secondsRemaining % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [secondsRemaining]);

  const hoursRemaining = Math.floor(secondsRemaining / 3600);
  const minutesRemaining = Math.floor((secondsRemaining % 3600) / 60);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl">
      {/* Background glow according to status */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          !isEnabled
            ? "bg-slate-700/20"
            : colorClass === "green"
            ? "bg-emerald-500/15"
            : colorClass === "orange"
            ? "bg-amber-500/15"
            : "bg-rose-500/20"
        }`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left / Info Section */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isExecuting
                  ? "bg-amber-400 animate-ping"
                  : isEnabled
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-slate-300 font-semibold tracking-wide uppercase">
              {isExecuting
                ? "Pipeline Executing Live"
                : isEnabled
                ? "Autonomous Schedule Active"
                : "Schedule Paused"}
            </span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Next Automated Blog Post
            </h3>
            <p className="text-slate-400 text-sm sm:text-base mt-1.5 max-w-xl">
              The AI autonomous agent scans verified industry web sources, synthesizes ~1,200 words in Bangla, and publishes automatically every day.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Target Time</div>
              <div className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
                {timezone === "Asia/Dhaka" || timezone === "BST"
                  ? `${scheduleTime} AM Dhaka (BST)`
                  : `${scheduleTime} ${timezone}`}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Local Trigger</div>
              <div className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
                {nextScheduledDateStr || "Calculating..."}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Target Length</div>
              <div className="text-sm sm:text-base font-bold text-lime-400 mt-0.5">
                1,000 – 1,200+ Words
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            {onRunNow && (
              <button
                type="button"
                onClick={onRunNow}
                disabled={isExecuting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-lime-500/20 active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isExecuting ? "Executing Pipeline..." : "Run Automation Now"}</span>
              </button>
            )}

            {onToggleSchedule && (
              <button
                type="button"
                onClick={onToggleSchedule}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition active:scale-95"
              >
                {isEnabled ? (
                  <>
                    <Pause className="w-4 h-4 text-amber-400" />
                    <span>Pause Daily Schedule</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-emerald-400" />
                    <span>Resume Daily Schedule</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right / Circular SVG Countdown Clock */}
        <div className="flex flex-col items-center justify-center">
          <style jsx>{`
            .base-timer {
              position: relative;
              width: 260px;
              height: 260px;
            }

            @media (min-width: 640px) {
              .base-timer {
                width: 280px;
                height: 280px;
              }
            }

            .base-timer__svg {
              transform: scaleX(-1);
              width: 100%;
              height: 100%;
            }

            .base-timer__circle {
              fill: none;
              stroke: none;
            }

            .base-timer__path-elapsed {
              stroke-width: 7px;
              stroke: #334155;
            }

            .base-timer__path-remaining {
              stroke-width: 7px;
              stroke-linecap: round;
              transform: rotate(90deg);
              transform-origin: center;
              transition: 1s linear all;
              fill-rule: nonzero;
              stroke: currentColor;
            }

            .base-timer__path-remaining.green {
              color: rgb(65, 184, 131);
            }

            .base-timer__path-remaining.orange {
              color: #f97316;
            }

            .base-timer__path-remaining.red {
              color: #ef4444;
            }

            .base-timer__path-remaining.paused {
              color: #64748b;
            }

            .base-timer__label {
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
          `}</style>

          <div className="base-timer">
            <svg
              className="base-timer__svg"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g className="base-timer__circle">
                <circle
                  className="base-timer__path-elapsed"
                  cx="50"
                  cy="50"
                  r="45"
                />
                <path
                  id="base-timer-path-remaining"
                  strokeDasharray={strokeDashoffset}
                  className={`base-timer__path-remaining ${colorClass}`}
                  d="
                    M 50, 50
                    m -45, 0
                    a 45,45 0 1,0 90,0
                    a 45,45 0 1,0 -90,0
                  "
                />
              </g>
            </svg>

            <div className="base-timer__label px-4">
              {isExecuting ? (
                <div className="flex flex-col items-center space-y-1 animate-pulse">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-1" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    GENERATING
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    Live Dispatch
                  </span>
                </div>
              ) : !isEnabled ? (
                <div className="flex flex-col items-center space-y-1">
                  <Pause className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-xl font-black tracking-widest text-slate-300">
                    PAUSED
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Schedule inactive
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold mb-0.5">
                    REMAINING TIME
                  </span>
                  <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white">
                    {formattedTime}
                  </span>
                  <span className="text-xs font-medium text-slate-400 mt-1">
                    {hoursRemaining > 0
                      ? `approx ${hoursRemaining}h ${minutesRemaining}m`
                      : `${minutesRemaining} minutes remaining`}
                  </span>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        colorClass === "green"
                          ? "bg-emerald-400"
                          : colorClass === "orange"
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                    />
                    <span>
                      {colorClass === "green"
                        ? "Optimal Window"
                        : colorClass === "orange"
                        ? "Imminent Run"
                        : "Triggering Soon"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
