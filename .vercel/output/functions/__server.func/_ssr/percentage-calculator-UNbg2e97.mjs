import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as CardHeader, d as Input, f as findCalculator, l as CardTitle, m as parseAmount, o as Card, s as CardContent } from "./card-CTjqIO9k.mjs";
import { t as ToolPage } from "./tool-page-B8H8hG1L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/percentage-calculator-UNbg2e97.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tool = findCalculator("percentage-calculator");
function PercentPage() {
	const [x, setX] = (0, import_react.useState)("15");
	const [y, setY] = (0, import_react.useState)("200");
	const [from, setFrom] = (0, import_react.useState)("50");
	const [to, setTo] = (0, import_react.useState)("75");
	const [part, setPart] = (0, import_react.useState)("25");
	const [whole, setWhole] = (0, import_react.useState)("200");
	const of = parseAmount(x) * parseAmount(y) / 100;
	const fromN = parseAmount(from);
	const toN = parseAmount(to);
	const change = fromN !== 0 ? (toN - fromN) / Math.abs(fromN) * 100 : 0;
	const ratio = parseAmount(whole) !== 0 ? parseAmount(part) / parseAmount(whole) * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolPage, {
		tool,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-2xl space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Calculate percentage (what is X% of Y?)"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "What is"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "w-24 text-center",
							value: x,
							onChange: (e) => setX(e.target.value),
							placeholder: "15"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "% of"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "w-28 text-center",
							value: y,
							onChange: (e) => setY(e.target.value),
							placeholder: "200"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold",
							children: "="
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-md bg-primary/10 px-3 py-1 font-mono text-xl font-bold text-primary",
							children: of.toFixed(2)
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Percentage increase or decrease"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "From"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "w-28 text-center",
							value: from,
							onChange: (e) => setFrom(e.target.value),
							placeholder: "50"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "to"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "w-28 text-center",
							value: to,
							onChange: (e) => setTo(e.target.value),
							placeholder: "75"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold",
							children: "="
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `rounded-md px-3 py-1 font-mono text-xl font-bold ${change >= 0 ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"}`,
							children: [change.toFixed(2), "%"]
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "X is what percent of Y?"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "w-28 text-center",
							value: part,
							onChange: (e) => setPart(e.target.value),
							placeholder: "25"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "is what % of"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "w-28 text-center",
							value: whole,
							onChange: (e) => setWhole(e.target.value),
							placeholder: "200"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold",
							children: "="
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-md bg-primary/10 px-3 py-1 font-mono text-xl font-bold text-primary",
							children: [ratio.toFixed(2), "%"]
						})
					]
				})] })
			]
		})
	});
}
//#endregion
export { PercentPage as component };
