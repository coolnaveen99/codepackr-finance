import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./router-LGmrD7dw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stat-grid-DW1epAA5.js
var import_jsx_runtime = require_jsx_runtime();
function StatGrid({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-elevated sm:grid-cols-3 sm:divide-x sm:divide-y-0",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 py-4 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted",
				children: item.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 font-mono text-xl font-semibold tabular-nums tracking-tight", item.tone === "brand" && "text-primary", item.tone === "ok" && "text-ok", item.tone === "danger" && "text-danger", (!item.tone || item.tone === "default") && "text-fg"),
				children: item.value
			})]
		}, item.label))
	});
}
//#endregion
export { StatGrid as t };
