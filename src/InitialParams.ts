import { Interval } from "./models/Interval";

export const InitialParams = {
	branch: "main" as "main" | "dev",

	maxTradeLength: 300,
	defaultSL: 10 / 100,
	defaultTP: 5 / 100,

	backtestSLArray: [5 / 100, 7 / 100, 10 / 100],
	backtestTPArray: [7 / 100, 10 / 100, 12 / 100],
	backtestMaxTradeLengthArray: [150, 300, 450],
	lookBackLengthBacktest: (7 * Interval["1d"]) / Interval["5m"],

	interval: Interval["5m"],
	lookBackLength: 200,
	fee: 0.0005,
	minAmountToTrade: 6,
	candlestickAPILimit: 500,
};
