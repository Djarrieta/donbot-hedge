import { accumulate } from ".";
import { chosenStrategies } from "../../strategies";
import { formatPercent } from "../../utils/formatPercent";

const { closedPositions, ...r } = await accumulate({
	log: false,
});

console.log(chosenStrategies.map((s) => s.stgName).join(", "));
console.table({
	maxTradeLength: r.maxTradeLength,
	sl: formatPercent(Number(r.sl)),
	tp: formatPercent(Number(r.tp)),
	tradesQty: r.tradesQty,
	avPnl: formatPercent(Number(r.avPnl)),
	avTradeLength: Number(r.avTradeLength).toFixed(1),
	winRate: formatPercent(Number(r.winRate)),
});

console.log("Winning pairs for the first result:");
