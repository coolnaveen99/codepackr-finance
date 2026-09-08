import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { m as Download } from "../_libs/lucide-react.mjs";
import { c as CardHeader, f as findCalculator, g as useCurrency, l as CardTitle, m as parseAmount, o as Card, p as formatMoney, r as Button, s as CardContent } from "./card-CTjqIO9k.mjs";
import { t as ToolPage } from "./tool-page-B8H8hG1L.mjs";
import { a as SelectItem, i as SelectContent, n as Field, o as SelectTrigger, r as Select, s as SelectValue, t as CurrencySelect } from "./field-_kJO3r4w.mjs";
import { a as investmentProjection, i as downloadCsv } from "./finance-DsaXmwri.mjs";
import { n as Segmented, t as Donut } from "./segmented-CKNQreoA.mjs";
import { t as StatGrid } from "./stat-grid-DW1epAA5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/investment-calculator-BjrRCrpV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tool = findCalculator("investment-calculator");
var FREQ = [
	{
		value: "12",
		label: "Monthly (12/year — recommended)"
	},
	{
		value: "4",
		label: "Quarterly (4/year)"
	},
	{
		value: "2",
		label: "Semi-annually (2/year)"
	},
	{
		value: "1",
		label: "Annually (1/year)"
	},
	{
		value: "365",
		label: "Daily (365/year)"
	}
];
function InvestmentPage() {
	const currency = useCurrency();
	const [principal, setPrincipal] = (0, import_react.useState)("10000");
	const [deposit, setDeposit] = (0, import_react.useState)("1000");
	const [cadence, setCadence] = (0, import_react.useState)("monthly");
	const [rate, setRate] = (0, import_react.useState)("8");
	const [freq, setFreq] = (0, import_react.useState)("12");
	const [tenure, setTenure] = (0, import_react.useState)("10");
	const [unit, setUnit] = (0, import_react.useState)("years");
	const [stepUp, setStepUp] = (0, import_react.useState)("0");
	const months = unit === "years" ? Math.round(parseAmount(tenure) * 12) : Math.round(parseAmount(tenure));
	const result = (0, import_react.useMemo)(() => investmentProjection({
		principal: parseAmount(principal),
		deposit: parseAmount(deposit),
		depositAnnual: cadence === "annually",
		annualRate: parseAmount(rate),
		compoundsPerYear: Number(freq),
		months: Math.max(0, months),
		stepUp: parseAmount(stepUp)
	}), [
		principal,
		deposit,
		cadence,
		rate,
		freq,
		months,
		stepUp
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolPage, {
		tool,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mx-auto max-w-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Investment inputs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, { id: "comp-currency" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Initial principal (${currency.symbol.trim()})`,
								value: principal,
								onChange: setPrincipal,
								placeholder: "e.g. 10000",
								hint: parseAmount(principal) > 0 ? formatMoney(parseAmount(principal), currency) : "Starting investment"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1.5 flex h-7 items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted",
									children: "Regular deposit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
									value: cadence,
									onChange: setCadence,
									options: [{
										value: "monthly",
										label: "Mo"
									}, {
										value: "annually",
										label: "Yr"
									}]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								value: deposit,
								onChange: setDeposit,
								placeholder: "e.g. 1000"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Annual interest rate (%)",
								value: rate,
								onChange: setRate,
								placeholder: "e.g. 8"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted",
								children: "Compounding frequency"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: freq,
								onValueChange: setFreq,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FREQ.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: f.value,
									children: f.label
								}, f.value)) })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 flex h-7 items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted",
								children: [
									"Tenure (",
									unit,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
								value: unit,
								onChange: setUnit,
								options: [{
									value: "years",
									label: "Yr"
								}, {
									value: "months",
									label: "Mo"
								}]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							value: tenure,
							onChange: setTenure,
							placeholder: "e.g. 10"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Annual step-up (year 2 onwards)",
						value: stepUp,
						onChange: setStepUp,
						placeholder: "0",
						suffix: "%",
						hint: "Gradually increase regular deposits each year"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatGrid, { items: [
						{
							label: "Total invested",
							value: formatMoney(result.invested, currency),
							tone: "brand"
						},
						{
							label: "Interest earned",
							value: `+${formatMoney(result.gain, currency)}`,
							tone: "ok"
						},
						{
							label: "Future value",
							value: formatMoney(result.maturity, currency)
						}
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Donut, {
						slices: [{
							name: "Principal + deposits",
							value: result.invested
						}, {
							name: "Interest",
							value: Math.max(0, result.gain)
						}],
						center: {
							title: "Future value",
							value: formatMoney(result.maturity, currency, { compact: true })
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => downloadCsv("investment-schedule.csv", [[
								"Year",
								"Added",
								"Interest",
								"Closing"
							], ...result.rows.map((r) => [
								String(r.year),
								r.invested.toFixed(2),
								r.interest.toFixed(2),
								r.closing.toFixed(2)
							])]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Export CSV"]
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { InvestmentPage as component };
