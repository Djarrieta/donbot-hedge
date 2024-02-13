import { EMA } from "technicalindicators";
import { Strategy, StrategyResponse } from "../models/Strategy";
import { Context } from "../models/Context";
import { getVolatility } from "../services/getSymbolList";
import { getSuperTrend } from "../utils/getSuperTrend";

const STG_NAME = "superTrend1h";
const stg: Strategy = {
	stgName: STG_NAME,
	lookBackLength: Context.lookBackLength,
	interval: Context.interval,
	validate: ({ candlestick, pair }) => {
		const response: StrategyResponse = {
			shouldTrade: null,
			sl: Context.defaultSL,
			tp: Context.defaultTP,
			stgName: STG_NAME,
		};

		if (candlestick.length < Context.lookBackLength) return response;

		const ema200Array = EMA.calculate({
			period: 200,
			values: candlestick.map((candle) => candle.close),
		});

		const stA1 = getSuperTrend({
			candlestick,
			multiplier: 3,
			period: 12,
		});
		const stA2 = getSuperTrend({
			candlestick,
			multiplier: 2,
			period: 11,
		});
		const stA3 = getSuperTrend({
			candlestick,
			multiplier: 1,
			period: 10,
		});

		const lastPrice = candlestick[candlestick.length - 1].close;

		const volatility = getVolatility({ candlestick });

		const MIN_VOL = 10 / 100;

		if (
			volatility > MIN_VOL &&
			lastPrice > ema200Array[ema200Array.length - 1] &&
			candlestick[candlestick.length - 1].close <
				candlestick[candlestick.length - 1].open &&
			lastPrice > stA3[stA3.length - 2] &&
			stA3[stA3.length - 2] > stA2[stA2.length - 2] &&
			stA2[stA2.length - 2] > stA1[stA1.length - 2] &&
			stA1[stA1.length - 3] > stA2[stA2.length - 3] &&
			stA2[stA2.length - 3] > stA3[stA3.length - 3] &&
			stA1[stA1.length - 4] > stA2[stA2.length - 4] &&
			stA2[stA2.length - 4] > stA3[stA3.length - 4] &&
			stA1[stA1.length - 6] > stA2[stA2.length - 6] &&
			stA2[stA2.length - 6] > stA3[stA3.length - 6] &&
			stA1[stA1.length - 8] > stA2[stA2.length - 8] &&
			stA2[stA2.length - 8] > stA3[stA3.length - 8] &&
			stA1[stA1.length - 10] > stA2[stA2.length - 10] &&
			stA2[stA2.length - 10] > stA3[stA3.length - 10]
		) {
			response.shouldTrade = "LONG";
		}
		if (
			volatility > MIN_VOL &&
			lastPrice < ema200Array[ema200Array.length - 1] &&
			candlestick[candlestick.length - 1].close >
				candlestick[candlestick.length - 1].open &&
			lastPrice < stA3[stA3.length - 2] &&
			stA3[stA3.length - 2] < stA2[stA2.length - 2] &&
			stA2[stA2.length - 2] < stA1[stA1.length - 2] &&
			stA1[stA1.length - 3] < stA2[stA2.length - 3] &&
			stA2[stA2.length - 3] < stA3[stA3.length - 3] &&
			stA1[stA1.length - 4] < stA2[stA2.length - 4] &&
			stA2[stA2.length - 4] < stA3[stA3.length - 4] &&
			stA1[stA1.length - 6] < stA2[stA2.length - 6] &&
			stA2[stA2.length - 6] < stA3[stA3.length - 6] &&
			stA1[stA1.length - 8] < stA2[stA2.length - 8] &&
			stA2[stA2.length - 8] < stA3[stA3.length - 8] &&
			stA1[stA1.length - 10] < stA2[stA2.length - 10] &&
			stA2[stA2.length - 10] < stA3[stA3.length - 10]
		) {
			response.shouldTrade = "SHORT";
		}
		return response;
	},
};

export default stg;
