import Binance from "binance-api-node";
import { Context } from "../models/Context";
import { Order } from "../models/Order";
import { Position, PositionSide, PositionStatus } from "../models/Position";
import { User } from "../models/User";
import { getDate } from "../utils/getDate";
import { getXataClient } from "../xata";
import { getHistoricalPnl } from "./getHistoricalPnl";
import { Interval } from "../models/Interval";
import { formatPercent } from "../utils/formatPercent";

export const getUserList = async () => {
	const xata = getXataClient();

	const page = await xata.db.users
		.select([
			"id",
			"key",
			"secret",
			"isActive",
			"name",
			"authorized",
			"branch",
			"startTime",
		])
		.filter({ branch: Context.branch })
		.getPaginated({
			pagination: {
				size: 10,
			},
		});

	let userList = page.records.map((u) => {
		return {
			id: u.id,
			name: u.name,
			isActive: u.isActive,
			authorized: u.authorized,
			key: u.key,
			secret: u.secret,
			branch: u.branch,
			startTime: u.startTime,
		};
	}) as User[];

	for (let index = 0; index < userList.length; index++) {
		const user = userList[index];
		const authExchange = Binance({
			apiKey: user.key,
			apiSecret: user.secret || "",
		});

		const positionRisk = await authExchange.futuresPositionRisk({
			recvWindow: 59999,
		});
		const openPositionsUnformatted = positionRisk.filter((x) =>
			Number(x.positionAmt)
		);

		const openPositions: Position[] = openPositionsUnformatted.map((p) => {
			const positionSide: PositionSide =
				Number(p.entryPrice) > Number(p.liquidationPrice) ? "LONG" : "SHORT";
			return {
				pair: p.symbol,
				positionSide,
				coinQuantity: Math.abs(Math.abs(Number(p.positionAmt))).toString(),
				startTime: getDate({ dateMs: p.updateTime }).date,
				entryPriceUSDT: Number(p.entryPrice),
				status: "unknown",
				orders: [],
			};
		});

		const pricesList = await authExchange.futuresPrices();
		for (let index = 0; index < openPositions.length; index++) {
			const position = openPositions[index];

			const openOrders = await authExchange.futuresOpenOrders({});
			const unformattedOrdersForThisPosition = openOrders.filter(
				(o) => o.symbol === position.pair
			);

			const ordersForThisPositions: Order[] =
				unformattedOrdersForThisPosition.map((o) => {
					return {
						pair: o.symbol,
						clientOrderId: o.clientOrderId,
						price: Number(o.stopPrice || o.clientOrderId.split("-")[2] || ""),
						coinQuantity: Number(o.origQty),
						orderType: (o.clientOrderId.split("-")[0] || "  ").slice(-2),
					};
				});
			let status: PositionStatus = "unknown";
			if (
				ordersForThisPositions.length === 2 ||
				ordersForThisPositions.find((o) => o.orderType === "SL") ||
				ordersForThisPositions.find((o) => o.orderType === "TP")
			) {
				status = "open";
			}
			openPositions[index] = {
				...position,
				orders: ordersForThisPositions,
				status,
			};
		}

		const futuresUser = await authExchange.futuresAccountBalance({
			recvWindow: 59999,
		});
		const balanceUSDT = Number(
			futuresUser.filter((pair) => pair.asset === "USDT")[0].balance
		);
		const { historicalPnl } = await getHistoricalPnl({ user });

		const totalPnlPt = historicalPnl.length
			? historicalPnl[historicalPnl.length - 1].acc /
			  (balanceUSDT - historicalPnl[historicalPnl.length - 1].acc)
			: 0;
		const todayPnlPt = historicalPnl.length
			? historicalPnl[historicalPnl.length - 1].value /
			  (balanceUSDT - historicalPnl[historicalPnl.length - 1].value)
			: 0;

		const openPosPnl = openPositions?.reduce((acc, val) => {
			const currentPrice = Number(pricesList[val.pair]) || 0;

			const pnl =
				val.positionSide === "LONG"
					? (currentPrice - val.entryPriceUSDT) / currentPrice
					: (val.entryPriceUSDT - currentPrice) / currentPrice;

			return (
				acc +
				((pnl - Context.fee / 2) * (currentPrice * Number(val.coinQuantity))) /
					Context.leverage
			);
		}, 0);
		const openPosPnlPt = Number(openPosPnl) / Number(balanceUSDT);

		const daysAgo = (
			(getDate({}).dateMs -
				getDate({ date: user.startTime || new Date() }).dateMs) /
			Interval["1d"]
		).toFixed();

		const text =
			(user.name?.split(" ")[0] || "") +
			" (" +
			user.branch +
			") " +
			daysAgo +
			" days $" +
			(balanceUSDT || 0).toFixed(2) +
			"; Today " +
			formatPercent(Number(todayPnlPt || 0)) +
			"; Total  " +
			formatPercent(Number(totalPnlPt || 0)) +
			"; OpenPosPnl " +
			formatPercent(Number(openPosPnlPt));

		userList[index] = {
			...user,
			openPositions,
			totalPnlPt,
			todayPnlPt,
			balanceUSDT,
			text,
			isAddingPosition: false,
		};
	}

	return userList;
};
