import { Component, Input, OnInit } from '@angular/core';

interface WeekDay {
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isActive: boolean;
}

interface Milestone {
  days: number;
  label: string;
  reward: string;
  badge: string;
}

@Component({
  selector: 'app-streak-tracker',
  templateUrl: './streak-tracker.component.html',
  styleUrls: ['./streak-tracker.component.scss'],
})
export class StreakTrackerComponent implements OnInit {
  @Input() streak: number = 0;

  public milestones: Milestone[] = [
    { days: 3, label: 'Warmup Coder', reward: '+50 XP', badge: '🌱' },
    { days: 7, label: 'Week Warrior', reward: '+150 XP', badge: '⚡' },
    { days: 14, label: 'Fortnight Hero', reward: '+300 XP', badge: '🔥' },
    { days: 30, label: 'Streak Master', reward: '+1,000 XP', badge: '👑' },
    { days: 100, label: 'Centurion', reward: '+5,000 XP', badge: '🏆' },
  ];

  public nextMilestone: Milestone = this.milestones[0];
  public progressToNext: number = 0;
  public weekDays: WeekDay[] = [];

  ngOnInit(): void {
    this.calculateProgress();
    this.buildWeekDays();
  }

  calculateProgress(): void {
    const next = this.milestones.find((m) => m.days > this.streak) || this.milestones[this.milestones.length - 1];
    this.nextMilestone = next;
    const prev = [...this.milestones].reverse().find((m) => m.days <= this.streak)?.days || 0;
    const range = next.days - prev;
    this.progressToNext = range > 0 ? Math.min(100, Math.max(0, Math.round(((this.streak - prev) / range) * 100))) : 100;
  }

  buildWeekDays(): void {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.weekDays = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      this.weekDays.push({
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        isToday: i === 0,
        isActive: i < this.streak,
      });
    }
  }
}
