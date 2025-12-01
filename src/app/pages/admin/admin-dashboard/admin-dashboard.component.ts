import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink,],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  
  stats = signal<any>(null);
  
  ngOnInit() {
    this.loadStats();
  }
  
  loadStats() {
    this.adminService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Erro ao carregar estatísticas', err)
    });
  }
}
