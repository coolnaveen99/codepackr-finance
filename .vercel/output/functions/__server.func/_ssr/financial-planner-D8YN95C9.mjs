import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { m as Download } from "../_libs/lucide-react.mjs";
import { c as CardHeader, f as findCalculator, g as useCurrency, l as CardTitle, m as parseAmount, n as Badge, o as Card, p as formatMoney, r as Button, s as CardContent } from "./card-CTjqIO9k.mjs";
import { t as ToolPage } from "./tool-page-B8H8hG1L.mjs";
import { n as Field, t as CurrencySelect } from "./field-_kJO3r4w.mjs";
import { i as downloadCsv, r as buildPlan, t as DEFAULT_PLANNER } from "./finance-DsaXmwri.mjs";
import { a as Area, i as XAxis, l as ResponsiveContainer, o as CartesianGrid, r as YAxis, t as AreaChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/financial-planner-D8YN95C9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tool = findCalculator("financial-planner");
function PlannerPage() {
	const currency = useCurrency();
	const [inputs, setInputs] = (0, import_react.useState)(DEFAULT_PLANNER);
	const plan = (0, import_react.useMemo)(() => buildPlan(inputs), [inputs]);
	const money = (n) => formatMoney(n, currency, { compact: true });
	const moneyFull = (n) => formatMoney(Math.round(n), currency, { digits: 0 });
	function set(key, raw) {
		if (key === "clientName") {
			setInputs((s) => ({
				...s,
				clientName: raw
			}));
			return;
		}
		setInputs((s) => ({
			...s,
			[key]: parseAmount(raw)
		}));
	}
	const ratio = plan.fundingRatio;
	const tone = ratio >= 1 ? "ok" : ratio >= .8 ? "warn" : "danger";
	const status = ratio >= 1.1 ? "Fully funded · surplus runway" : ratio >= 1 ? "Fully funded · on target" : ratio >= .8 ? "Moderate gap · minor adjustments needed" : "Significant shortfall · restructuring advised";
	const chart = [
		{
			age: inputs.currentAge,
			corpus: inputs.currentCorpus
		},
		...plan.accumulation.map((r) => ({
			age: r.age,
			corpus: r.closingCorpus
		})),
		...plan.retirement.map((r) => ({
			age: r.age,
			corpus: r.closingCorpus
		}))
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolPage, {
		tool,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Plan assumptions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, { id: "plan-currency" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Client name",
							value: inputs.clientName,
							onChange: (v) => set("clientName", v),
							className: "font-sans"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Current age",
							value: String(inputs.currentAge),
							onChange: (v) => set("currentAge", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Retirement age",
							value: String(inputs.retirementAge),
							onChange: (v) => set("retirementAge", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Life expectancy",
							value: String(inputs.lifeExpectancy),
							onChange: (v) => set("lifeExpectancy", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Annual income (${currency.symbol.trim()})`,
							value: String(inputs.annualIncome),
							onChange: (v) => set("annualIncome", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Income growth (%)",
							value: String(inputs.incomeGrowth),
							onChange: (v) => set("incomeGrowth", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Annual expenses (${currency.symbol.trim()})`,
							value: String(inputs.annualExpenses),
							onChange: (v) => set("annualExpenses", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Inflation (%)",
							value: String(inputs.inflation),
							onChange: (v) => set("inflation", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Current corpus (${currency.symbol.trim()})`,
							value: String(inputs.currentCorpus),
							onChange: (v) => set("currentCorpus", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Monthly SIP (${currency.symbol.trim()})`,
							value: String(inputs.monthlySip),
							onChange: (v) => set("monthlySip", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "SIP step-up (%)",
							value: String(inputs.sipStepUp),
							onChange: (v) => set("sipStepUp", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Annual lump sum (${currency.symbol.trim()})`,
							value: String(inputs.annualLumpSum),
							onChange: (v) => set("annualLumpSum", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Pre-retirement return (%)",
							value: String(inputs.preReturn),
							onChange: (v) => set("preReturn", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Post-retirement return (%)",
							value: String(inputs.postReturn),
							onChange: (v) => set("postReturn", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Emergency fund (${currency.symbol.trim()})`,
							value: String(inputs.emergencyFund),
							onChange: (v) => set("emergencyFund", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Emergency months",
							value: String(inputs.emergencyMonths),
							onChange: (v) => set("emergencyMonths", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Total debt (${currency.symbol.trim()})`,
							value: String(inputs.totalDebt),
							onChange: (v) => set("totalDebt", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Annual debt payment (${currency.symbol.trim()})`,
							value: String(inputs.annualDebtPayment),
							onChange: (v) => set("annualDebtPayment", v)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Pension / other income (${currency.symbol.trim()})`,
							value: String(inputs.annualRetirementIncome),
							onChange: (v) => set("annualRetirementIncome", v)
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 lg:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "lg:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Retirement readiness" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: tone,
								children: plan.sustainabilityStatus
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: status
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: "Projected corpus",
									value: money(plan.projectedCorpus)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: "Required corpus",
									value: money(plan.requiredCorpus)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: "Funding ratio",
									value: `${(plan.fundingRatio * 100).toFixed(1)}%`,
									tone
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: "Years to retire",
									value: String(plan.yearsToRetirement)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: "Required monthly SIP",
									value: moneyFull(plan.requiredMonthlySip)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									label: "Independence age",
									value: plan.financialIndependenceAge ? String(plan.financialIndependenceAge) : "—"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Financial health"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-4xl font-semibold tabular-nums",
							children: plan.financialHealth.toFixed(0)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-xs text-muted",
							children: "Composite score / 100"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: plan.healthBreakdown.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: h.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono tabular-nums",
									children: h.score.toFixed(0)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 overflow-hidden rounded-full bg-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-primary",
									style: { width: `${Math.min(100, h.score)}%` }
								})
							})] }, h.label))
						})
					] })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Corpus path"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: chart,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "age",
									tick: { fontSize: 11 }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: { fontSize: 11 },
									width: 56
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "var(--surface)",
									border: "1px solid var(--border)",
									borderRadius: 8,
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "corpus",
									name: "Corpus",
									stroke: "var(--brand)",
									fill: "var(--brand-light)"
								})
							]
						})
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Market scenario stress testing"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-fg text-bg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2.5",
									children: "Scenario"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2.5",
									children: "Pre / post return"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2.5 text-right",
									children: "Projected corpus"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2.5 text-right",
									children: "Required target"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2.5 text-right",
									children: "Funding ratio"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: plan.scenarios.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: s.key === "base" ? "bg-primary/5 font-semibold" : "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2",
									children: [s.label, s.key === "base" ? " (base model)" : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2",
									children: [
										s.preReturn,
										"% / ",
										s.postReturn,
										"%"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(s.projectedCorpus)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(s.requiredCorpus)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: [(s.fundingRatio * 100).toFixed(1), "%"]
								})
							]
						}, s.key)) })]
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Recommendations"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-3",
					children: plan.recommendations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: r.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: r.detail
						})]
					}, r.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Year-by-year actuarial schedule"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => downloadCsv("retirement-schedule.csv", [
							[
								"Phase",
								"Year",
								"Age",
								"Opening",
								"Flow",
								"Growth",
								"Closing"
							],
							...plan.accumulation.map((r) => [
								"Accumulation",
								String(r.year),
								String(r.age),
								r.openingCorpus.toFixed(0),
								r.annualContribution.toFixed(0),
								r.investmentGrowth.toFixed(0),
								r.closingCorpus.toFixed(0)
							]),
							...plan.retirement.map((r) => [
								"Withdrawal",
								String(r.year),
								String(r.age),
								r.openingCorpus.toFixed(0),
								(-r.withdrawal).toFixed(0),
								r.growth.toFixed(0),
								r.closingCorpus.toFixed(0)
							])
						]),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Export CSV"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "max-h-96 overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "sticky top-0 bg-elevated text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2",
									children: "Age"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2",
									children: "Phase"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right",
									children: "Opening"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right",
									children: "Contribution / withdrawal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right",
									children: "Growth"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right",
									children: "Closing"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [plan.accumulation.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: r.age
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: "Saving"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(r.openingCorpus)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(r.annualContribution)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(r.investmentGrowth)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(r.closingCorpus)
								})
							]
						}, `a-${r.year}`)), plan.retirement.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: r.age
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: "Retired"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(r.openingCorpus)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 text-right font-mono text-danger",
									children: ["−", money(r.withdrawal)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(r.growth)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: money(r.closingCorpus)
								})
							]
						}, `w-${r.year}`))] })]
					})
				})] })
			]
		})
	});
}
function Metric({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: `mt-1 font-mono text-lg font-semibold tabular-nums ${tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : tone === "danger" ? "text-danger" : "text-fg"}`,
		children: value
	})] });
}
//#endregion
export { PlannerPage as component };
