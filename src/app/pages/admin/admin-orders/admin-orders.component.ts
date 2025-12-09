import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  
  orders = signal<any[]>([]);
  expandedOrderId = signal<string | number | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  toggleDetails(orderId: string | number) {
    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(orderId);
    }
  }

  loadOrders() {
    // Carregar pedidos do backend
    this.adminService.getOrders().subscribe({
      next: (backendOrders) => {
        // Carregar pedidos locais
        let localOrders = [];
        if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem('local_orders');
          localOrders = stored ? JSON.parse(stored) : [];
        }

        // Combinar e ordenar por data (mais recente primeiro)
        const allOrders = [...localOrders, ...backendOrders].sort((a, b) => {
          return new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime();
        });

        this.orders.set(allOrders);
      },
      error: (err) => {
        console.error(err);
        // Fallback: carregar apenas locais se backend falhar
        if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem('local_orders');
          if (stored) {
             this.orders.set(JSON.parse(stored).sort((a: any, b: any) => 
               new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime()
             ));
          }
        }
      }
    });
  }

  updateStatus(order: any, newStatus: string) {
    if (confirm(`Deseja alterar o status para "${newStatus}"?`)) {
      this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
        next: () => {
            alert('Status atualizado com sucesso!');
            this.loadOrders();
        },
        error: (err) => alert('Erro ao atualizar status.')
      });
    }
  }

  exportToCSV() {
    const data = this.orders();
    if (data.length === 0) return;

    const headers = ['ID', 'Cliente', 'Data', 'Total', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(o => [
        o.id, 
        `"${o.cliente}"`, 
        new Date(o.data_pedido).toLocaleDateString(), 
        o.valor_total, 
        o.status_pedido
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_vendas.csv';
    link.click();
  }

  printReport() {
    window.print();
  }
}
