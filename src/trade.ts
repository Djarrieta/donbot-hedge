import cron from "node-cron";
import { Context } from "./models/Context";
import { CronInterval } from "./models/Interval";
import { checkForTrades } from "./services/checkForTrades";
import {
	getSymbolList,
	getSymbolListVolatility,
} from "./services/getSymbolList";
import { getUserList } from "./services/getUserList";
import { markUnreadySymbols } from "./services/markUnreadySymbols";
import { updateUnreadySymbols } from "./services/updateUnreadySymbols";
import { delay } from "./utils/delay";
import { getDate } from "./utils/getDate";
import { positionManageNew } from "./services/positionManageNew";
import { positionManageExisting } from "./services/positionManageExisting";

export const trade = async () => {
	console.log(
		getDate({}).dateString,
		"Starting in " + Context.branch + " branch..."
	);
	const context = await Context.getInstance();

	await getSymbolList();
	console.log(
		getDate({}).dateString,
		context.symbolList.length + " symbols updated!"
	);

	context.userList = await getUserList();
	console.log(getDate({}).dateString, "User list updated!");
	console.log(
		"Users: " + context.userList.map((u) => u.name?.split(" ")[0]).join(", ")
	);

	for (const user of context.userList) {
		await positionManageExisting({ user });
	}

	cron.schedule(CronInterval["1m"], async () => {
		await delay(1000);
		console.log("");
		console.log(getDate({}).dateString, "Checking for trades!");
		console.log(
			"Users: " + context.userList.map((u) => u.name?.split(" ")[0]).join(", ")
		);

		await markUnreadySymbols();
		await getSymbolListVolatility();

		const readySymbols = [...context.symbolList]
			.filter((s) => s.isReady && !s.isLoading)
			.sort((a, b) => Number(b.volatility) - Number(a.volatility));

		const { text: tradeArrayText, tradeArray } = await checkForTrades({
			readySymbols,
		});

		if (tradeArray.length) {
			console.log(tradeArrayText);

			for (const user of context.userList) {
				for (const trade of tradeArray) {
					trade.stgResponse.shouldTrade &&
						positionManageNew({
							user,
							symbol: trade.symbol,
							shouldTrade: trade.stgResponse.shouldTrade,
							sl: trade.stgResponse.sl,
							tp: Number(trade.stgResponse.tp),
							callback: Number(trade.stgResponse.sl),
						});
				}
			}
		} else {
			console.log("No trades found");
		}
		await updateUnreadySymbols();
		await delay(5000);
		context.userList = await getUserList();
		for (const user of context.userList) {
			positionManageExisting({ user });
		}
		context.userList = await getUserList();
	});
};

trade();
