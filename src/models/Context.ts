import { Interval } from "./Interval";
import { StrategyStat } from "./Strategy";
import { Symbol } from "./Symbol";
import { User } from "./User";

export class Context {
	private constructor() {}
	private static instance: Context | null = null;
	public static async getInstance() {
		if (Context.instance === null) {
			Context.instance = new Context();
		}

		return Context.instance;
	}
	public static async resetInstance() {
		Context.instance = null;
	}
	symbolList: Symbol[] = [];
	userList: User[] = [];
	strategyStats: StrategyStat[] = [];
	expositionLevel = 1;

	public static candlestickAPILimit = 500;
	public static branch: "main" | "test" | "risk" = "main";
	public static interval = Interval["5m"];
	public static leverage = 10; //WIP: Implement
	public static lookBackLength = 200;
	public static lookBackLengthBacktest = (2 * Interval["1d"]) / Interval["5m"];
	public static amountToTradePt = 0.75;
	public static maxTradeLength = 200;
	public static minVolatility = 10 / 100;
	public static minAmountToTrade = 6;
	public static fee = 0.0005;
	public static defaultSL = 10 / 100;
	public static defaultTP = 1 / 100;
	public static defaultSC = 0.2 / 100;
	public static shouldStop = false;
	public static maxHedgePositions = 3;
	public static maxProtectedPositions = 1;
}
