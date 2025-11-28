import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseHistoryService {

  constructor() { }

  getPurchaseHistory() {
    return of([
      {
        date: new Date(),
        items: ['Produto 1', 'Produto 2'],
        total: 100,
        status: 'Entregue'
      },
      {
        date: new Date(),
        items: ['Produto 3'],
        total: 50,
        status: 'Enviado'
      }
    ]);
  }
}
