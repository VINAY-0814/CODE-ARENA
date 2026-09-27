import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  category: string;
  points: number;
  acceptanceRate: number;
  totalAttempts: number;
}

@Component({
  selector: 'app-daily-challenge',
  templateUrl: './daily-challenge.component.html',
  styleUrls: ['./daily-challenge.component.scss'],
})
export class DailyChallengeComponent implements OnInit {
  public problem: Problem | null = null;
  public loading: boolean = true;
  public error: string | null = null;
  public timeUntilReset: string = '';
  public isSolved: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchDailyProblem();
    this.startCountdown();
  }

  fetchDailyProblem(): void {
    this.loading = true;
    this.error = null;
    this.http.get<{ problem: Problem }>('/api/problems/daily').subscribe({
      next: (res) => {
        this.problem = res.problem;
        const user = this.authService.currentUserValue;
        this.isSolved = !!(user && user.solvedProblemIds?.includes(this.problem.id));
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to fetch daily challenge';
        this.loading = false;
      },
    });
  }

  startCountdown(): void {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      this.timeUntilReset = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    update();
    setInterval(update, 1000);
  }

  onSolveNow(): void {
    if (this.problem) {
      this.router.navigate(['/challenges', this.problem.slug || this.problem.id]);
    }
  }
}
