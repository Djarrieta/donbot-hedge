export const ORDER_ID_DIV = "____";

export enum OrderType {
	NEW = "NEW",
	HEDGE = "HEDGE",
	PROFIT = "PROFIT",
	SEC = "SEC",
	UNKNOWN = "UNKNOWN",
}

export interface Order {
	pair: string;
	clientOrderId: string;
	price: number;
	coinQuantity: number;
	orderType: OrderType;
}
