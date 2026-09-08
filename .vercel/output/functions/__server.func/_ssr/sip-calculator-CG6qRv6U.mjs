import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { m as Download } from "../_libs/lucide-react.mjs";
import { c as CardHeader, f as findCalculator, g as useCurrency, l as CardTitle, m as parseAmount, o as Card, p as formatMoney, r as Button, s as CardContent } from "./card-CTjqIO9k.mjs";
import { t as ToolPage } from "./tool-page-B8H8hG1L.mjs";
import { n as Field, t as CurrencySelect } from "./field-_kJO3r4w.mjs";
import { i as downloadCsv, s as sipProjection } from "./finance-DsaXmwri.mjs";
import { a as Area, i as XAxis, l as ResponsiveContainer, o as CartesianGrid, r as YAxis, t as AreaChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { n as Segmented, t as Donut } from "./segmented-CKNQreoA.mjs";
import { t as StatGrid } from "./stat-grid-DW1epAA5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sip-calculator-CG6qRv6U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tool = findCalculator("sip-calculator");
function SipPage() {
	const currency = useCurrency();
	const [monthly, setMonthly] = (0, import_react.useState)("10000");
	const [rate, setRate] = (0, import_react.useState)("12");
	const [tenure, setTenure] = (0, import_react.useState)("10");
	const [unit, setUnit] = (0, import_react.useState)("years");
	const [stepUp, setStepUp] = (0, import_react.useState)("0");
	const [inflation, setInflation] = (0, import_react.useState)("0");
	const months = unit === "years" ? Math.round(parseAmount(tenure) * 12) : Math.round(parseAmount(tenure));
	const result = (0, import_react.useMemo)(() => sipProjection({
		monthly: parseAmount(monthly),
		annualRate: parseAmount(rate),
		months: Math.max(0, months),
		stepUp: parseAmount(stepUp),
		inflation: parseAmount(inflation)
	}), [
		monthly,
		rate,
		months,
		stepUp,
		inflation
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolPage, {
		tool,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mx-auto max-w-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "SIP inputs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, { id: "sip-currency" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Monthly investment (${currency.symbol.trim()})`,
								value: monthly,
								onChange: setMonthly,
								placeholder: "e.g. 10000",
								hint: parseAmount(monthly) > 0 ? formatMoney(parseAmount(monthly), currency) : "Enter monthly SIP"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Expected return rate (%)",
								value: rate,
								onChange: setRate,
								placeholder: "e.g. 12",
								hint: `${parseAmount(rate) || 0}% per annum`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 rounded-lg border border-border bg-elevated p-3.5 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Annual step-up (year 2 onwards)",
							value: stepUp,
							onChange: setStepUp,
							placeholder: "0",
							suffix: "%",
							hint: "Increase SIP each year"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Inflation rate adjustment (%)",
							value: inflation,
							onChange: setInflation,
							placeholder: "0 (nominal returns)",
							suffix: "%",
							hint: parseAmount(inflation) > 0 ? `Real purchasing power discounted at ${parseAmount(inflation)}%/yr` : "Displays nominal maturity value"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatGrid, { items: [
						{
							label: "Total invested",
							value: formatMoney(result.invested, currency),
							tone: "brand"
						},
						{
							label: "Est. wealth gain",
							value: `+${formatMoney(result.gain, currency)}`,
							tone: "ok"
						},
						{
							label: "Expected maturity",
							value: formatMoney(result.maturity, currency)
						}
					] }),
					parseAmount(inflation) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-center text-xs text-muted",
						children: ["Inflation-adjusted value: ", formatMoney(result.realValue, currency)]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-sm font-semibold",
						children: "SIP wealth breakdown"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Donut, {
						slices: [{
							name: "Invested",
							value: result.invested
						}, {
							name: "Wealth gain",
							value: Math.max(0, result.gain)
						}],
						center: {
							title: "Maturity",
							value: formatMoney(result.maturity, currency, { compact: true })
						}
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: result.rows,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--border)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "year",
										tick: { fontSize: 11 }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: { fontSize: 11 },
										width: 48
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--surface)",
										border: "1px solid var(--border)",
										borderRadius: 8,
										fontSize: 12
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "closing",
										name: "Corpus",
										stroke: "var(--brand)",
										fill: "var(--brand-light)"
									})
								]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => downloadCsv("sip-schedule.csv", [[
								"Year",
								"Invested",
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
export { SipPage as component };
