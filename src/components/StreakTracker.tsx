import React from 'react';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { User } from '../types';

interface StreakTrackerProps {
  user: User | null;
  onNavigate?: (view: string, param?: string) => void;
  className?: string;
}

interface Milestone {
  days: number;
  label: string;
  reward: string;
  badge: string;
}

const MILESTONES: Milestone[] = [
  { days: 3, label: 'Warmup Coder', reward: '+50 XP', badge: '🌱' },
  { days: 7, label: 'Week Warrior', reward: '+150 XP', badge: '⚡' },
  { days: 14, label: 'Fortnight Hero', reward: '+300 XP', badge: '🔥' },
  { days: 30, label: 'Streak Master', reward: '+1,000 XP', badge: '👑' },
  { days: 100, label: 'Centurion', reward: '+5,000 XP', badge: '🏆' },
];

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  user,
  onNavigate,
  className = '',
}) => {
  const currentStreak = user?.streak || 0;

  // Determine next milestone
  const nextMilestone =
    MILESTONES.find((m) => m.days > currentStreak) || MILESTONES[MILESTONES.length - 1];
  const prevMilestoneDays =
    [...MILESTONES].reverse().find((m) => m.days <= currentStreak)?.days || 0;

  // Calculate progress percentage to next milestone
  const milestoneRange = nextMilestone.days - prevMilestoneDays;
  const progressToNext =
    milestoneRange > 0
      ? Math.min(
          100,
          Math.max(0, Math.round(((currentStreak - prevMilestoneDays) / milestoneRange) * 100))
        )
      : 100;

  // Generate 7-day rolling window (past 6 days + today)
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDays = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const isToday = i === 0;

    // A day is considered active if within current streak days
    // If streak is e.g. 4, the last 4 days in window are active
    const isActive = i < currentStreak;

    weekDays.push({
      date: d,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday,
      isActive,
    });
  }

  // Flame intensity styling based on streak
  const getFlameStyles = () => {
    if (currentStreak >= 30) {
      return {
        container: 'bg-[#211A28] border-[#A855F7]/40',
        flameColor: 'text-[#F97316] fill-[#F97316]',
        glowColor: 'rgba(249, 115, 22, 0.45)',
        statusText: 'Godlike Flame! 👑',
        statusColor: 'text-[#F59E0B]',
      };
    }
    if (currentStreak >= 14) {
      return {
        container: 'bg-[#211A28] border-[#F97316]/35',
        flameColor: 'text-[#F97316] fill-[#F97316]',
        glowColor: 'rgba(249, 115, 22, 0.35)',
        statusText: 'Unstoppable Momentum! 🔥',
        statusColor: 'text-[#F97316]',
      };
    }
    if (currentStreak >= 7) {
      return {
        container: 'bg-[#211A28] border-[#F97316]/30',
        flameColor: 'text-[#F97316] fill-[#F97316]',
        glowColor: 'rgba(249, 115, 22, 0.25)',
        statusText: 'On Fire! Keep Going ⚡',
        statusColor: 'text-[#F97316]',
      };
    }
    if (currentStreak >= 1) {
      return {
        container: 'bg-[#211A28] border-[#2e2439]',
        flameColor: 'text-[#F97316] fill-[#F97316]',
        glowColor: 'rgba(249, 115, 22, 0.2)',
        statusText: 'Active Streak 🌱',
        statusColor: 'text-[#F97316]',
      };
    }
    return {
      container: 'bg-[#211A28] border-[#2e2439]',
      flameColor: 'text-[#A1A1AA]',
      glowColor: 'transparent',
      statusText: 'Start Your Streak Today',
      statusColor: 'text-[#A1A1AA]',
    };
  };

  const flameConfig = getFlameStyles();

  return (
    <div
      className={`relative overflow-hidden p-5 sm:p-6 ${flameConfig.container} backdrop-blur-md border rounded-2xl shadow-xl shadow-black/40 transition-all ${className}`}
    >
      {/* Background ambient warmth glow */}
      <div
        className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ background: flameConfig.glowColor }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Flame Icon, Counter, and Status */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Flame Icon with pulsating halo */}
          <div className="relative shrink-0">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#17131C] border border-[#2e2439] flex items-center justify-center shadow-inner group"
              style={{
                boxShadow: currentStreak > 0 ? `0 0 24px ${flameConfig.glowColor}` : 'none',
              }}
            >
              <Flame
                className={`w-8 h-8 sm:w-9 sm:h-9 ${flameConfig.flameColor} transition-transform duration-300 group-hover:scale-110 animate-pulse`}
              />
            </div>
            {currentStreak > 0 && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F97316] border border-[#17131C]"></span>
              </span>
            )}
          </div>

          {/* Streak Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                Streak Tracker
              </span>
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#17131C] border border-[#2e2439] ${flameConfig.statusColor}`}
              >
                {flameConfig.statusText}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#FAFAFA] tracking-tight tabular-nums">
                {currentStreak}
              </span>
              <span className="text-sm font-semibold text-[#A1A1AA]">
                {currentStreak === 1 ? 'day streak' : 'days streak'}
              </span>
            </div>

            <p className="text-xs text-[#A1A1AA]">
              {currentStreak > 0
                ? `Next goal: ${nextMilestone.days} days for ${nextMilestone.label} (${nextMilestone.reward})`
                : 'Solve any challenge today to begin your streak!'}
            </p>
          </div>
        </div>

        {/* Right Side: 7-Day Visual Progress & Milestone Bar */}
        <div className="flex flex-col gap-3 md:items-end w-full md:w-auto">
          {/* 7-Day Rolling Bubble Chain */}
          <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2">
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1"
                title={`${day.dayName} (${day.date.toLocaleDateString()}): ${
                  day.isActive ? 'Active Streak Solved' : day.isToday ? 'Today (Pending)' : 'Inactive'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-mono transition-all ${
                    day.isActive
                      ? 'bg-[#F97316]/15 border border-[#F97316]/40 text-[#F97316] shadow-sm shadow-[#F97316]/20'
                      : day.isToday
                      ? 'bg-[#17131C] border-2 border-[#A855F7] text-[#FAFAFA] animate-pulse'
                      : 'bg-[#17131C] border border-[#2e2439] text-[#A1A1AA]/50'
                  }`}
                >
                  {day.isActive ? (
                    <Flame className="w-4 h-4 fill-[#F97316] text-[#F97316]" />
                  ) : day.isToday ? (
                    <Clock className="w-3.5 h-3.5 text-[#A855F7]" />
                  ) : (
                    <span>{day.dayNumber}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono ${
                    day.isToday
                      ? 'text-[#A855F7] font-bold'
                      : day.isActive
                      ? 'text-[#F97316] font-medium'
                      : 'text-[#A1A1AA]'
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            ))}
          </div>

          {/* Visual Progress Bar to Next Milestone */}
          <div className="w-full md:w-64 space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-[#F59E0B]" />
                <span>
                  {nextMilestone.badge} {nextMilestone.days}d Goal
                </span>
              </span>
              <span className="text-[#FAFAFA] font-semibold">
                {currentStreak}/{nextMilestone.days} days ({progressToNext}%)
              </span>
            </div>

            {/* Gradient Bar */}
            <div className="w-full h-2 bg-[#17131C] border border-[#2e2439] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F97316] via-[#A855F7] to-[#F59E0B] rounded-full transition-all duration-700 ease-out shadow-sm shadow-[#A855F7]/30"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
