import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { d as useRouterState, v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Sun, c as Receipt, d as Moon, h as DollarSign, i as Target, l as PiggyBank, p as Heart, r as TrendingUp, s as Search, t as X, u as Percent, v as Calculator } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-LGmrD7dw.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-CTjqIO9k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GROUPS = [
	{
		id: "all",
		label: "All calculators"
	},
	{
		id: "retirement",
		label: "Retirement"
	},
	{
		id: "loans",
		label: "Loans"
	},
	{
		id: "investing",
		label: "Investing"
	},
	{
		id: "everyday",
		label: "Everyday"
	}
];
var CALCULATORS = [
	{
		id: "financial-planner",
		path: "/financial-planner",
		name: "Financial Planning & Retirement",
		description: "Analyze retirement readiness, projected vs required corpus, savings gap, scenarios, and recommendations.",
		group: "retirement",
		icon: Target,
		popular: true,
		isNew: true
	},
	{
		id: "loan-calculator",
		path: "/loan-calculator",
		name: "Loan & EMI Calculator",
		description: "Calculate monthly loan EMI, total interest, and a comprehensive repayment timeline.",
		group: "loans",
		icon: DollarSign
	},
	{
		id: "sip-calculator",
		path: "/sip-calculator",
		name: "SIP Calculator",
		description: "Calculate Systematic Investment Plan returns, wealth gain, step-up SIPs, and growth charts.",
		group: "investing",
		icon: TrendingUp,
		popular: true
	},
	{
		id: "investment-calculator",
		path: "/investment-calculator",
		name: "Investment Calculator",
		description: "Project investment growth with periodic deposits, compounding choices, and a tenure switcher.",
		group: "investing",
		icon: PiggyBank,
		popular: true
	},
	{
		id: "calculator",
		path: "/calculator",
		name: "Scientific Calculator",
		description: "Fast arithmetic, trigonometric, exponential, and algebraic calculations.",
		group: "everyday",
		icon: Calculator
	},
	{
		id: "percentage-calculator",
		path: "/percentage-calculator",
		name: "Percentage Calculator",
		description: "Calculate percentages, percent increases and decreases, and fractional ratios.",
		group: "everyday",
		icon: Percent
	},
	{
		id: "tip-calculator",
		path: "/tip-calculator",
		name: "Tip Calculator",
		description: "Quickly calculate bill tips, total payable, and split by person count.",
		group: "everyday",
		icon: Receipt
	}
];
function findCalculator(id) {
	return CALCULATORS.find((c) => c.id === id);
}
function relatedCalculators(id, limit = 3) {
	const current = findCalculator(id);
	if (!current) return CALCULATORS.slice(0, limit);
	const same = CALCULATORS.filter((c) => c.id !== id && c.group === current.group);
	const rest = CALCULATORS.filter((c) => c.id !== id && c.group !== current.group);
	return [...same, ...rest].slice(0, limit);
}
var CURRENCIES = [
	{
		code: "USD",
		symbol: "$",
		name: "US Dollar",
		decimalPlaces: 2
	},
	{
		code: "EUR",
		symbol: "€",
		name: "Euro",
		decimalPlaces: 2
	},
	{
		code: "GBP",
		symbol: "£",
		name: "British Pound",
		decimalPlaces: 2
	},
	{
		code: "INR",
		symbol: "₹",
		name: "Indian Rupee",
		decimalPlaces: 2
	},
	{
		code: "JPY",
		symbol: "¥",
		name: "Japanese Yen",
		decimalPlaces: 0
	},
	{
		code: "CAD",
		symbol: "C$",
		name: "Canadian Dollar",
		decimalPlaces: 2
	},
	{
		code: "AUD",
		symbol: "A$",
		name: "Australian Dollar",
		decimalPlaces: 2
	},
	{
		code: "CHF",
		symbol: "CHF ",
		name: "Swiss Franc",
		decimalPlaces: 2
	},
	{
		code: "SGD",
		symbol: "S$",
		name: "Singapore Dollar",
		decimalPlaces: 2
	},
	{
		code: "AED",
		symbol: "AED ",
		name: "UAE Dirham",
		decimalPlaces: 2
	},
	{
		code: "SAR",
		symbol: "SAR ",
		name: "Saudi Riyal",
		decimalPlaces: 2
	},
	{
		code: "NZD",
		symbol: "NZ$",
		name: "New Zealand Dollar",
		decimalPlaces: 2
	}
];
var DEFAULT_CURRENCY = CURRENCIES.find((c) => c.code === "INR") ?? CURRENCIES[0];
function formatMoney(value, currency, options = {}) {
	if (!Number.isFinite(value)) return "—";
	const digits = options.digits ?? currency.decimalPlaces;
	const abs = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	if (options.compact) {
		if (currency.code === "INR") {
			if (abs >= 1e7) return `${sign}${currency.symbol}${(abs / 1e7).toFixed(2)} Cr`;
			if (abs >= 1e5) return `${sign}${currency.symbol}${(abs / 1e5).toFixed(2)} L`;
		} else {
			if (abs >= 1e9) return `${sign}${currency.symbol}${(abs / 1e9).toFixed(2)}B`;
			if (abs >= 1e6) return `${sign}${currency.symbol}${(abs / 1e6).toFixed(2)}M`;
			if (abs >= 1e3) return `${sign}${currency.symbol}${(abs / 1e3).toFixed(1)}K`;
		}
	}
	const locale = currency.code === "INR" ? "en-IN" : "en-US";
	return `${sign}${currency.symbol}${abs.toLocaleString(locale, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	})}`;
}
function parseAmount(raw) {
	const cleaned = raw.replace(/[^0-9.\-]/g, "");
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : 0;
}
var usePrefs = create()(persist((set, get) => ({
	currencyCode: DEFAULT_CURRENCY.code,
	theme: "light",
	favorites: [],
	setCurrency: (code) => set({ currencyCode: code }),
	setTheme: (theme) => {
		set({ theme });
		if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", theme === "dark");
	},
	toggleFavorite: (id) => {
		set({ favorites: get().favorites.includes(id) ? get().favorites.filter((x) => x !== id) : [...get().favorites, id] });
	}
}), { name: "codepackr-finance-prefs" }));
function useCurrency() {
	const code = usePrefs((s) => s.currencyCode);
	return CURRENCIES.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
}
function applyStoredTheme() {
	try {
		const raw = localStorage.getItem("codepackr-finance-prefs");
		if (!raw) return;
		if (JSON.parse(raw).state?.theme === "dark") document.documentElement.classList.add("dark");
	} catch {}
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:bg-primary-hover",
			secondary: "bg-elevated text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			outline: "border border-border bg-transparent text-fg hover:bg-elevated",
			ghost: "text-fg hover:bg-elevated",
			danger: "bg-danger text-white hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-lg px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-fg/40", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-1/2 top-1/2 z-50 grid w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-surface p-5 text-fg shadow-[var(--shadow-border)]", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-3 top-3 rounded-sm p-2 text-muted hover:bg-elevated hover:text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl font-semibold tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg shadow-none outline-none transition-[box-shadow,border-color] duration-[var(--motion-quick)] placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono tabular-nums", className),
	ref,
	...props
}));
Input.displayName = "Input";
function AppShell({ children }) {
	const theme = usePrefs((s) => s.theme);
	const setTheme = usePrefs((s) => s.setTheme);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		applyStoredTheme();
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setSearchOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, { position: "bottom-right" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-w-0 items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-8 items-center justify-center rounded-md bg-primary font-display text-sm font-semibold text-primary-fg",
								children: "C"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-display text-base font-semibold leading-tight tracking-tight",
									children: "Codepackr Finance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-xs text-muted sm:block",
									children: "finance.codepackr.com"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSearchOpen(true),
							className: "ml-auto hidden h-10 max-w-xs flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 text-left text-sm text-muted sm:flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1",
									children: "Search calculators"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
									className: "rounded-sm border border-border px-1.5 py-0.5 font-mono text-xs",
									children: "⌘K"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "icon",
							className: "ml-auto sm:ml-0",
							"aria-label": "Search",
							onClick: () => setSearchOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 sm:hidden" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only sm:hidden",
								children: "Search"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
							onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
							children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "All calculations run locally in your browser. Nothing is uploaded." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Developer tools stay on",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "font-medium text-primary underline-offset-2 hover:underline",
							href: "https://www.codepackr.com",
							target: "_blank",
							rel: "noreferrer",
							children: "codepackr.com"
						})
					] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialog, {
				open: searchOpen,
				onOpenChange: setSearchOpen
			})
		]
	});
}
function SearchDialog({ open, onOpenChange }) {
	const [q, setQ] = (0, import_react.useState)("");
	const navigate = useNavigate();
	const matches = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		if (!needle) return CALCULATORS;
		return CALCULATORS.filter((c) => c.name.toLowerCase().includes(needle) || c.description.toLowerCase().includes(needle) || c.group.includes(needle));
	}, [q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Search calculators" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Jump to any finance tool. Developer tools are not here." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					autoFocus: true,
					value: q,
					placeholder: "EMI, SIP, retirement…",
					onChange: (e) => setQ(e.target.value),
					className: "font-sans"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "max-h-72 overflow-auto",
					children: [matches.map((tool) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-elevated",
						onClick: () => {
							onOpenChange(false);
							navigate({ to: tool.path });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tool.icon, { className: "mt-0.5 size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-medium",
							children: tool.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted",
							children: tool.description
						})] })]
					}) }, tool.id)), matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-2 py-6 text-center text-sm text-muted",
						children: "No matching calculators."
					}) : null]
				})
			]
		})
	});
}
function GroupNav({ value, onChange }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const favorites = usePrefs((s) => s.favorites);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap gap-2",
		children: [GROUPS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(g.id),
			className: cn("h-10 rounded-full px-3.5 text-sm font-medium", value === g.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg"),
			children: g.label
		}, g.id)), pathname === "/" && favorites.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onChange("favorites"),
			className: cn("inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium", value === "favorites" ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5" }), "Favorites"]
		}) : null]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide uppercase", {
	variants: { variant: {
		default: "bg-primary/12 text-primary",
		muted: "bg-elevated text-muted",
		ok: "bg-ok/12 text-ok",
		warn: "bg-warn/12 text-warn",
		danger: "bg-danger/12 text-danger"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl bg-surface text-fg shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)]", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col gap-1.5 p-5", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
	ref,
	className: cn("font-display text-lg font-semibold leading-snug tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
	ref,
	className: cn("text-sm text-muted", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-5 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
//#endregion
export { usePrefs as _, CURRENCIES as a, CardHeader as c, Input as d, findCalculator as f, useCurrency as g, relatedCalculators as h, CALCULATORS as i, CardTitle as l, parseAmount as m, Badge as n, Card as o, formatMoney as p, Button as r, CardContent as s, AppShell as t, GroupNav as u };
