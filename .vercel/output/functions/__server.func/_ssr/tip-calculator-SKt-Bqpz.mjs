import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as CardHeader, f as findCalculator, g as useCurrency, l as CardTitle, m as parseAmount, o as Card, p as formatMoney, s as CardContent } from "./card-CTjqIO9k.mjs";
import { t as ToolPage } from "./tool-page-B8H8hG1L.mjs";
import { n as Field, t as CurrencySelect } from "./field-_kJO3r4w.mjs";
import { t as StatGrid } from "./stat-grid-DW1epAA5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tip-calculator-SKt-Bqpz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tool = findCalculator("tip-calculator");
function TipPage() {
	const currency = useCurrency();
	const [bill, setBill] = (0, import_react.useState)("85.50");
	const [tip, setTip] = (0, import_react.useState)("18");
	const [people, setPeople] = (0, import_react.useState)("2");
	const result = (0, import_react.useMemo)(() => {
		const b = parseAmount(bill);
		const t = parseAmount(tip);
		const n = Math.max(1, Math.round(parseAmount(people) || 1));
		const tipAmt = b * t / 100;
		const total = b + tipAmt;
		return {
			tipAmt,
			total,
			per: total / n,
			n
		};
	}, [
		bill,
		tip,
		people
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolPage, {
		tool,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mx-auto max-w-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Bill split"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, { id: "tip-currency" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Bill amount (${currency.symbol.trim()})`,
							value: bill,
							onChange: setBill,
							placeholder: "e.g. 85.50"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Tip percentage (${parseAmount(tip) || 0}%)`,
							value: tip,
							onChange: setTip,
							placeholder: "e.g. 18"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Split (people)",
							value: people,
							onChange: setPeople,
							placeholder: "1",
							inputMode: "numeric"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatGrid, { items: [
					{
						label: "Tip",
						value: formatMoney(result.tipAmt, currency),
						tone: "ok"
					},
					{
						label: "Total bill",
						value: formatMoney(result.total, currency)
					},
					{
						label: "Per person",
						value: formatMoney(result.per, currency),
						tone: "brand"
					}
				] })]
			})]
		})
	});
}
//#endregion
export { TipPage as component };
