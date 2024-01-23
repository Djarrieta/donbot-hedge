import cron from "node-cron";
import { Context } from "./models/Context";
import { getSymbolList } from "./services/getSymbolList";
import { getUserList } from "./services/getUserList";
import { markUnreadySymbols } from "./services/markUnreadySymbols";
import { updateUnreadySymbols } from "./services/updateUnreadySymbols";
import { checkForTrades } from "./useCase/checkForTrades";
import { delay } from "./utils/delay";
import { getDate } from "./utils/getDate";

console.log(
	getDate({}).dateString,
	"Starting in " + Context.branch + " branch..."
);
const context = await Context.getInstance();

console.log("");
await getSymbolList();
console.log(getDate({}).dateString, "Symbol list updated!");

console.log("");
context.userList = await getUserList();
console.log(getDate({}).dateString, "User list updated!");
console.log(
	"Users: " + context.userList.map((u) => u.name?.split(" ")[0]).join(", ")
);

cron.schedule("*/1 * * * *", async () => {
	await delay(2000);
	console.log("");
	console.log(getDate({}).dateString, "Checking for trades!");
	console.log(
		"Users: " + context.userList.map((u) => u.name?.split(" ")[0]).join(", ")
	);

	await markUnreadySymbols();
	await checkForTrades({
		readySymbols: context.symbolList.filter((s) => s.isReady && !s.isLoading),
	}); // WIP: should return an array of symbols
	await updateUnreadySymbols();
});
