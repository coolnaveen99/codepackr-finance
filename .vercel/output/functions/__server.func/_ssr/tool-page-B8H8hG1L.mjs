import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as ArrowLeft, o as Share2, p as Heart } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as usePrefs, c as CardHeader, h as relatedCalculators, l as CardTitle, n as Badge, o as Card, r as Button, s as CardContent, t as AppShell } from "./card-CTjqIO9k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tool-page-B8H8hG1L.js
var import_jsx_runtime = require_jsx_runtime();
function ToolPage({ tool, children }) {
	const favorites = usePrefs((s) => s.favorites);
	const toggleFavorite = usePrefs((s) => s.toggleFavorite);
	const saved = favorites.includes(tool.id);
	const related = relatedCalculators(tool.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "All calculators"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-semibold tracking-tight",
						children: tool.name
					}), tool.isNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "New" }) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-muted",
					children: tool.description
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					size: "sm",
					onClick: () => toggleFavorite(tool.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: saved ? "fill-primary text-primary" : "" }), saved ? "Saved" : "Save"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: async () => {
						try {
							await navigator.clipboard.writeText(window.location.href);
							toast.success("Link copied");
						} catch {
							toast.error("Could not copy link");
						}
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {}), "Copy link"]
				})]
			})]
		}),
		children,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-xl font-semibold",
				children: "Related calculators"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: related.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: r.path,
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "h-full hover:shadow-[var(--shadow-border-hover)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-2 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(r.icon, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: r.name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-4 pt-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: r.description
							})
						})]
					})
				}, r.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-8 text-xs text-subtle",
			children: "Figures are estimates for planning only, not tax, investment, or credit advice. Confirm with a qualified adviser before acting."
		})
	] });
}
//#endregion
export { ToolPage as t };
