import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  
  users = signal<any[]>([]);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error(err)
    });
  }

  exportToCSV() {
    const data = this.users();
    if (data.length === 0) return;

    const headers = ['ID', 'Nome', 'Email', 'Data Cadastro'];
    const csvContent = [
      headers.join(','),
      ...data.map(u => [
        u.id, 
        `"${u.nome_completo}"`, 
        u.email, 
        new Date(u.data_cadastro).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_usuarios.csv';
    link.click();
  }

  printReport() {
    window.print();
  }
}
