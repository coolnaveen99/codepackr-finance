import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { f as Lock, p as Heart, s as Search, y as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as cn } from "./router-LGmrD7dw.mjs";
import { _ as usePrefs, i as CALCULATORS, n as Badge, o as Card, s as CardContent, t as AppShell, u as GroupNav } from "./card-CTjqIO9k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CtJ0rYwk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [group, setGroup] = (0, import_react.useState)("all");
	const favorites = usePrefs((s) => s.favorites);
	const toggleFavorite = usePrefs((s) => s.toggleFavorite);
	const tools = (0, import_react.useMemo)(() => {
		if (group === "favorites") return CALCULATORS.filter((c) => favorites.includes(c.id));
		if (group === "all") return CALCULATORS;
		return CALCULATORS.filter((c) => c.group === group);
	}, [group, favorites]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-10 max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary",
					children: "Codepackr Finance"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl",
					children: "Calculators only. Everything else stays on the main site."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-2xl text-lg text-muted",
					children: "The calculator suite from codepackr.com, moved here as a dedicated finance hub. EMI, SIP, investments, retirement planning, and everyday math — all 100% in-browser."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5 text-primary" }), "Zero data leaves the browser"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "inline-flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5 text-primary" }),
							CALCULATORS.length,
							" calculators, no developer tools"
						]
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupNav, {
			value: group,
			onChange: setGroup
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: tools.map((tool) => {
				const saved = favorites.includes(tool.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "group relative flex flex-col hover:shadow-[var(--shadow-border-hover)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex h-full flex-col p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(tool.icon, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [
										tool.isNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "New" }) : null,
										tool.popular ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "muted",
											children: "Popular"
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": saved ? "Remove from favorites" : "Save calculator",
											onClick: () => toggleFavorite(tool.id),
											className: "relative flex size-11 items-center justify-center rounded-sm text-muted hover:bg-elevated hover:text-fg",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", saved && "fill-primary text-primary") })
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-semibold leading-snug",
								children: tool.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 flex-1 text-sm text-muted",
								children: tool.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: tool.path,
								className: "mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg hover:bg-primary-hover",
								children: ["Launch", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						]
					})
				}, tool.id);
			})
		}),
		tools.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-10 text-center text-sm text-muted",
			children: "No saved calculators yet."
		}) : null
	] });
}
//#endregion
export { Home as component };
