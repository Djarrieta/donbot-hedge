import { Context } from "./models/Context";
import { Interval } from "./models/Interval";
import { Stat } from "./models/Stat";
import { Strategy } from "./models/Strategy";
import { getCandlestick } from "./services/getCandlestick";
import { getProfitStickAnalysis } from "./services/getProfitStickAnalysis";
import { getCompletePairList } from "./services/getSymbolList";
import { chosenStrategies } from "./strategies";
import { fixPrecision } from "./utils/fixPrecision";
import { formatPercent } from "./utils/formatPercent";
import { getDate } from "./utils/getDate";

export const backtest = async ({
	strategy,
	log = true,
}: {
	strategy: Strategy;
	log?: boolean;
}) => {
	const lookBackLength =
		(Context.backTestLookBackDays * Interval["1d"]) / strategy.interval;
	const startTime = getDate({}).dateMs - lookBackLength * strategy.interval;

	console.log("Back testing with " + strategy);

	const { sl, tp, tr } = strategy.validate({
		candlestick: [
			{ open: 0, close: 0, high: 0, low: 0, openTime: new Date(), volume: 0 },
		],
	});

	log &&
		tr &&
		console.log("**Trailing value are not taken into account in the analysis.");

	log &&
		console.table({
			sl: formatPercent(sl),
			tp: formatPercent(Number(tp)),
			backTestLookBackDays: Context.backTestLookBackDays,
			lookBackLength,
			startTime: getDate({ dateMs: startTime }).dateString,
			interval: Interval[strategy.interval],
			maxTradeLength: Context.maxTradeLength,
			fee: formatPercent(Context.fee),
		});

	const completePairList = await getCompletePairList();

	let stats: Stat[] = [];

	for (const symbol of completePairList) {
		const { pair } = symbol;

		const completeCandlestick = await getCandlestick({
			pair,
			interval: strategy.interval,
			lookBackLength,
		});

		let candleIndex = 0;
		do {
			const endIndex = candleIndex + strategy.lookBackLength;
			const candlestick = completeCandlestick.slice(candleIndex, endIndex);
			const profitStick = completeCandlestick.slice(
				endIndex,
				endIndex + Context.maxTradeLength
			);

			const { shouldTrade, sl, tp, stgName } = strategy.validate({
				candlestick,
				pair,
			});

			if (shouldTrade) {
				const stat: Stat = getProfitStickAnalysis({
					pair,
					shouldTrade,
					profitStick,
					sl,
					tp,
					fee: Context.fee,
					stgName,
				});

				stats.push(stat);
				log && console.log(stat.debug);
			}

			candleIndex++;
		} while (
			completeCandlestick.slice(
				candleIndex,
				candleIndex + strategy.lookBackLength
			).length >= strategy.lookBackLength
		);
	}

	const tradesQty = stats.length;
	const totalPnl = stats.reduce((acc, a) => acc + a.pnl, 0);
	const avPnl = totalPnl / tradesQty || 0;
	const winningPos = stats.filter((stat) => stat.status === "WON").length;
	const avWinRate = winningPos / tradesQty || 0;
	const avTradeLength =
		stats.reduce((acc, a) => acc + a.tradeLength, 0) / tradesQty || 0;

	const result = {
		sl: formatPercent(sl),
		tp: formatPercent(Number(tp)),
		backTestLookBackDays: Context.backTestLookBackDays,
		lookBackLength,
		startTime: getDate({ dateMs: startTime }).dateString,
		interval: Interval[strategy.interval],
		maxTradeLength: Context.maxTradeLength,
		fee: formatPercent(Context.fee),
		avWinRate: formatPercent(avWinRate),
		avPnl,
		totalPnl: formatPercent(totalPnl),
		tradesQty,
		avTradeLength: Number(fixPrecision({ value: avTradeLength, precision: 0 })),
	};

	return result;
};

for (const strategy of chosenStrategies) {
	console.time("Backtest");
	const backtestResult = await backtest({ strategy, log: true });
	console.table({
		...backtestResult,
		avPnl: formatPercent(backtestResult.avPnl),
	});
	console.timeEnd("Backtest");
}
