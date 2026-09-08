import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { m as Download } from "../_libs/lucide-react.mjs";
import { c as CardHeader, f as findCalculator, g as useCurrency, l as CardTitle, m as parseAmount, o as Card, p as formatMoney, r as Button, s as CardContent } from "./card-CTjqIO9k.mjs";
import { t as ToolPage } from "./tool-page-B8H8hG1L.mjs";
import { n as Field, t as CurrencySelect } from "./field-_kJO3r4w.mjs";
import { i as downloadCsv, n as annualizeSchedule, o as loanSchedule } from "./finance-DsaXmwri.mjs";
import { n as Segmented, t as Donut } from "./segmented-CKNQreoA.mjs";
import { t as StatGrid } from "./stat-grid-DW1epAA5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/loan-calculator-BNBWOTSm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tool = findCalculator("loan-calculator");
function LoanPage() {
	const currency = useCurrency();
	const [principal, setPrincipal] = (0, import_react.useState)("50000");
	const [rate, setRate] = (0, import_react.useState)("10");
	const [tenure, setTenure] = (0, import_react.useState)("5");
	const [unit, setUnit] = (0, import_react.useState)("years");
	const [view, setView] = (0, import_react.useState)("annual");
	const [open, setOpen] = (0, import_react.useState)(true);
	const months = unit === "years" ? Math.round(parseAmount(tenure) * 12) : Math.round(parseAmount(tenure));
	const result = (0, import_react.useMemo)(() => loanSchedule({
		principal: parseAmount(principal),
		annualRate: parseAmount(rate),
		months: Math.max(0, months)
	}), [
		principal,
		rate,
		months
	]);
	const annual = (0, import_react.useMemo)(() => annualizeSchedule(result.rows), [result.rows]);
	const principalPct = result.totalPayment > 0 ? parseAmount(principal) / result.totalPayment * 100 : 0;
	const interestPct = result.totalPayment > 0 ? result.totalInterest / result.totalPayment * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolPage, {
		tool,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mx-auto max-w-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Loan inputs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, { id: "loan-currency" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Principal amount (${currency.symbol.trim()})`,
								value: principal,
								onChange: setPrincipal,
								placeholder: "e.g. 50000",
								hint: parseAmount(principal) > 0 ? formatMoney(parseAmount(principal), currency) : "Enter loan amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Annual interest rate (%)",
								value: rate,
								onChange: setRate,
								placeholder: "e.g. 10",
								hint: `${parseAmount(rate) || 0}% per annum`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex h-7 items-center justify-between",
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
									placeholder: "e.g. 5"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatGrid, { items: [
						{
							label: "Monthly EMI",
							value: formatMoney(result.emi, currency),
							tone: "brand"
						},
						{
							label: "Total interest",
							value: formatMoney(result.totalInterest, currency),
							tone: "danger"
						},
						{
							label: "Total payment",
							value: formatMoney(result.totalPayment, currency)
						}
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Donut, {
							slices: [{
								name: "Principal",
								value: parseAmount(principal)
							}, {
								name: "Interest",
								value: result.totalInterest
							}],
							center: {
								title: "Total",
								value: formatMoney(result.totalPayment, currency, { compact: true })
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 self-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: "Loan breakdown"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
									color: "var(--brand)",
									title: "Principal loan amount",
									sub: `${principalPct.toFixed(1)}% of total repayment`,
									value: formatMoney(parseAmount(principal), currency)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
									color: "var(--danger)",
									title: "Total interest payable",
									sub: `${interestPct.toFixed(1)}% of total repayment`,
									value: formatMoney(result.totalInterest, currency),
									valueClass: "text-danger"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex h-2 overflow-hidden rounded-full bg-elevated",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "bg-primary",
										style: { width: `${Math.min(100, principalPct)}%` }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "bg-danger",
										style: { width: `${Math.min(100, interestPct)}%` }
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "text-sm font-semibold text-primary",
								onClick: () => setOpen((v) => !v),
								children: [
									"Amortization schedule (",
									currency.code,
									" ",
									currency.symbol.trim(),
									")"
								]
							}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
									value: view,
									onChange: setView,
									options: [{
										value: "annual",
										label: "Annual"
									}, {
										value: "monthly",
										label: "Monthly"
									}]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => {
										const rows = view === "annual" ? [[
											"Year",
											"Opening",
											"Principal",
											"Interest",
											"Closing"
										], ...annual.map((r) => [
											String(r.year),
											r.opening.toFixed(2),
											r.principalPaid.toFixed(2),
											r.interestPaid.toFixed(2),
											r.closing.toFixed(2)
										])] : [[
											"Period",
											"Opening",
											"Principal",
											"Interest",
											"Closing"
										], ...result.rows.map((r) => [
											String(r.period),
											r.opening.toFixed(2),
											r.principalPaid.toFixed(2),
											r.interestPaid.toFixed(2),
											r.closing.toFixed(2)
										])];
										downloadCsv("loan-amortization.csv", rows);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Export CSV"]
								})]
							}) : null]
						}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 max-h-96 overflow-auto rounded-lg border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "sticky top-0 bg-elevated text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2.5 font-semibold",
											children: view === "annual" ? "Year" : "Period"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2.5 text-right font-semibold",
											children: "Opening balance"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2.5 text-right font-semibold",
											children: "Principal paid"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2.5 text-right font-semibold",
											children: "Interest paid"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2.5 text-right font-semibold",
											children: "Closing balance"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (view === "annual" ? annual.map((r) => ({
									key: r.year,
									label: r.year,
									...r
								})) : result.rows.map((r) => ({
									key: r.period,
									label: r.period,
									...r
								}))).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 font-medium",
											children: r.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-right font-mono tabular-nums",
											children: formatMoney(r.opening, currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-right font-mono tabular-nums",
											children: formatMoney(r.principalPaid, currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-right font-mono tabular-nums",
											children: formatMoney(r.interestPaid, currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-right font-mono tabular-nums",
											children: formatMoney(r.closing, currency)
										})
									]
								}, r.key)) })]
							})
						}) : null]
					})
				]
			})]
		})
	});
}
function Legend({ color, title, sub, value, valueClass }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-3 shrink-0 rounded-full",
				style: { background: color }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: sub
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-mono text-sm font-bold tabular-nums ${valueClass ?? "text-primary"}`,
			children: value
		})]
	});
}
//#endregion
export { LoanPage as component };
