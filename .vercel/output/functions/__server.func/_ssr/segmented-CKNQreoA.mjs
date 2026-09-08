import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./router-LGmrD7dw.mjs";
import { c as Cell, l as ResponsiveContainer, n as PieChart, s as Pie, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/segmented-CKNQreoA.js
var import_jsx_runtime = require_jsx_runtime();
var COLORS = [
	"var(--brand)",
	"var(--ok)",
	"var(--warn)",
	"var(--danger)"
];
function Donut({ slices, center }) {
	const data = slices.filter((s) => s.value > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-56 w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
				data,
				dataKey: "value",
				nameKey: "name",
				innerRadius: 62,
				outerRadius: 88,
				paddingAngle: 2,
				stroke: "none",
				children: data.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: COLORS[i % COLORS.length] }, i))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
				formatter: (v, n) => [v.toLocaleString(), n],
				contentStyle: {
					background: "var(--surface)",
					border: "1px solid var(--border)",
					borderRadius: 8,
					fontSize: 12
				}
			})] })
		}), center ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: center.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-sm font-semibold tabular-nums",
				children: center.value
			})]
		}) : null]
	});
}
function Segmented({ value, onChange, options, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("inline-flex rounded-md border border-border bg-elevated p-0.5", className),
		role: "tablist",
		children: options.map((opt) => {
			const active = opt.value === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				role: "tab",
				"aria-selected": active,
				onClick: () => onChange(opt.value),
				className: cn("h-8 min-w-11 rounded-sm px-2.5 text-xs font-semibold transition-colors duration-[var(--motion-quick)]", active ? "bg-primary text-primary-fg" : "text-muted hover:text-fg"),
				children: opt.label
			}, opt.value);
		})
	});
}
//#endregion
export { Segmented as n, Donut as t };
