export interface Order {
    id: number;
    data_pedido: string | Date;
    status_pedido: string;
    valor_total: number;
    cliente: string;
}
