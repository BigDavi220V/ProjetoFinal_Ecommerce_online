import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { PurchaseHistoryService } from '../../services/purchase-history.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  user: any;
  purchaseHistory: any;

  constructor(private userService: UserService, private purchaseHistoryService: PurchaseHistoryService) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe(data => {
      this.user = data;
    });

    this.purchaseHistoryService.getPurchaseHistory().subscribe(data => {
      this.purchaseHistory = data;
    });
  }
}
