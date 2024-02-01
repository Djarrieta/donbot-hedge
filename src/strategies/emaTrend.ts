import { rsi, EMA } from "technicalindicators";
import { Strategy, StrategyResponse } from "../models/Strategy";
import { Context } from "../models/Context";
import { getVolatility } from "../services/getSymbolList";

const STG_NAME = "emaTrend";
const stg: Strategy = {
	stgName: STG_NAME,
	lookBackLength: Context.lookBackLength,
	interval: Context.interval,
	validate: ({ candlestick, pair }) => {
		const response: StrategyResponse = {
			shouldTrade: null,
			sl: Context.defaultSL,
			tp: Context.defaultTP, // undefined to have dynamic tp with quitCriteria
			stgName: STG_NAME,
		};

		if (candlestick.length < Context.lookBackLength) return response;

		const MIN_RSI = 30;
		const MIN_VOL = 2 / 100;

		const closePrices = candlestick.map((candle) => candle.close);
		const ema20Array = EMA.calculate({ period: 20, values: closePrices });
		const ema200Array = EMA.calculate({ period: 200, values: closePrices });
		const rsiArray = rsi({ period: 14, values: closePrices });
		const volatility = getVolatility({ candlestick });

		const currentPrice = candlestick[candlestick.length - 1].close;

		const ema200DiffPt =
			(currentPrice - ema200Array[ema200Array.length - 1]) / currentPrice;

		if (
			volatility > MIN_VOL &&
			ema200DiffPt < 0.2 / 100 &&
			ema200DiffPt > 0 &&
			currentPrice < ema20Array[ema20Array.length - 1] &&
			rsiArray[rsiArray.length - 1] < MIN_RSI &&
			rsiArray[rsiArray.length - 2] < rsiArray[rsiArray.length - 1]
		) {
			response.shouldTrade = "LONG";
		}

		if (
			volatility > MIN_VOL &&
			ema200DiffPt > -0.2 / 100 &&
			ema200DiffPt < 0 &&
			currentPrice < ema200Array[ema200Array.length - 1] &&
			currentPrice > ema20Array[ema20Array.length - 1] &&
			rsiArray[rsiArray.length - 1] > 100 - MIN_RSI &&
			rsiArray[rsiArray.length - 2] > rsiArray[rsiArray.length - 1]
		) {
			response.shouldTrade = "SHORT";
		}

		return response;
	},
};

export default stg;

// ┌────────────────┬─────────────────────┐
// │                │ Values              │
// ├────────────────┼─────────────────────┤
// │        stgName │ emaTrend            │
// │             sl │ 0.50%               │
// │             tp │ 0.50%               │
// │       lookBack │ 1440                │
// │      startTime │ 2024 01 31 18:13:01 │
// │       interval │ 1m                  │
// │ maxTradeLength │ 1000                │
// │            fee │ 0.05%               │
// │      avWinRate │ 59.09%              │
// │          avPnl │ 0.04%               │
// │       totalPnl │ 0.90%               │
// │      tradesQty │ 22                  │
// │  avTradeLength │ 15                  │
// └────────────────┴─────────────────────┘