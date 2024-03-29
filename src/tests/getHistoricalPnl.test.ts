import { describe, expect, test, mock, jest } from "bun:test";
import { getHistoricalPnl } from "../services/getHistoricalPnl";
import { User } from "../models/User";

describe("getHistoricalPnl function", () => {
	const mockUser: User = {
		id: "1",
		todayPnlPt: 0,
		totalPnlPt: 0,
		text: "",
		openPosPnlPt: 0,
		openPositions: [],
		openOrders: [],
		isAddingPosition: false,
		isActive: true,
		balanceUSDT: 0,
		authorized: true,
		key: "",
		secret: "",
		startTime: new Date("2022-01-01T00:00:00.000Z"),
	};

	const mockAuthExchange = {
		futuresUserTrades: jest.fn().mockReturnValue([
			{
				symbol: "BTCUSDT",
				realizedPnl: "10.0",
				commission: "1.0",
				time: new Date("2022-02-01T10:00:00.000Z"),
			},
			{
				symbol: "ETHUSDT",
				realizedPnl: "-5.0",
				commission: "0.5",
				time: new Date("2022-02-01T15:30:00.000Z"),
			},
		]),
	};

	mock.module("binance-api-node", () => ({
		__esModule: true,
		default: () => mockAuthExchange,
	}));

	test("returns historical PnL data", async () => {
		const result = await getHistoricalPnl({ user: mockUser });

		expect(result.historicalPnl).toEqual([
			{
				acc: 395.5,
				time: "2022-02-01",
				value: 395.5,
			},
		]);
	});
});
