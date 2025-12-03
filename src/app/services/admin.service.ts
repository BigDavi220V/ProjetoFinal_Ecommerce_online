import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:2009/admin'; // Base admin URL

  constructor(private http: HttpClient) { }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${orderId}/status`, { status });
  }

  createProduct(productData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/produtos`, productData);
  }

  uploadGallery(productId: number, images: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/produtos/${productId}/galeria`, images);
  }

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:2009/produtos');
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produtos/${productId}`);
  }
}
