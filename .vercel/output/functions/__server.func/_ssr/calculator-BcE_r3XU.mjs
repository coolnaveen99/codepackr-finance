import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn } from "./router-LGmrD7dw.mjs";
import { f as findCalculator, o as Card, s as CardContent } from "./card-CTjqIO9k.mjs";
import { t as ToolPage } from "./tool-page-B8H8hG1L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calculator-BcE_r3XU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Tiny expression evaluator for the scientific calculator. No eval(). */
function tokenize(src) {
	const out = [];
	let i = 0;
	const s = src.replace(/π/g, "pi").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
	while (i < s.length) {
		const ch = s[i];
		if (ch === " ") {
			i += 1;
			continue;
		}
		if (/[0-9.]/.test(ch)) {
			let n = ch;
			i += 1;
			while (i < s.length && /[0-9.]/.test(s[i])) {
				n += s[i];
				i += 1;
			}
			out.push(n);
			continue;
		}
		if (/[a-z]/i.test(ch)) {
			let n = ch;
			i += 1;
			while (i < s.length && /[a-z]/i.test(s[i])) {
				n += s[i];
				i += 1;
			}
			out.push(n.toLowerCase());
			continue;
		}
		if (ch === "*" && s[i + 1] === "*") {
			out.push("^");
			i += 2;
			continue;
		}
		out.push(ch);
		i += 1;
	}
	return out;
}
function peek(p) {
	return p.tokens[p.i];
}
function eat(p, expected) {
	const t = p.tokens[p.i];
	if (expected && t !== expected) throw new Error("Invalid expression");
	p.i += 1;
	return t;
}
function parseExpr(p) {
	let v = parseTerm(p);
	while (peek(p) === "+" || peek(p) === "-") {
		const op = eat(p);
		const r = parseTerm(p);
		v = op === "+" ? v + r : v - r;
	}
	return v;
}
function parseTerm(p) {
	let v = parsePower(p);
	while (peek(p) === "*" || peek(p) === "/") {
		const op = eat(p);
		const r = parsePower(p);
		v = op === "*" ? v * r : v / r;
	}
	return v;
}
function parsePower(p) {
	const v = parseUnary(p);
	if (peek(p) === "^") {
		eat(p);
		return Math.pow(v, parsePower(p));
	}
	return v;
}
function parseUnary(p) {
	if (peek(p) === "+") {
		eat(p);
		return parseUnary(p);
	}
	if (peek(p) === "-") {
		eat(p);
		return -parseUnary(p);
	}
	return parsePrimary(p);
}
function parsePrimary(p) {
	const t = peek(p);
	if (t === void 0) throw new Error("Incomplete expression");
	if (t === "pi") {
		eat(p);
		return Math.PI;
	}
	if (t === "e") {
		eat(p);
		return Math.E;
	}
	if (/^[0-9.]/.test(t)) {
		eat(p);
		const n = Number(t);
		if (!Number.isFinite(n)) throw new Error("Invalid number");
		return n;
	}
	if (t === "(") {
		eat(p);
		const v = parseExpr(p);
		eat(p, ")");
		return v;
	}
	const fns = {
		sin: Math.sin,
		cos: Math.cos,
		tan: Math.tan,
		asin: Math.asin,
		acos: Math.acos,
		atan: Math.atan,
		ln: Math.log,
		log: (x) => Math.log10(x),
		sqrt: Math.sqrt,
		abs: Math.abs,
		exp: Math.exp
	};
	if (fns[t]) {
		eat(p);
		eat(p, "(");
		const v = parseExpr(p);
		eat(p, ")");
		return fns[t](v);
	}
	throw new Error("Invalid expression");
}
function evaluate(expression) {
	const p = {
		tokens: tokenize(expression),
		i: 0
	};
	if (p.tokens.length === 0) return 0;
	const v = parseExpr(p);
	if (p.i !== p.tokens.length) throw new Error("Invalid expression");
	if (!Number.isFinite(v)) throw new Error("Not a finite number");
	return v;
}
function formatResult(n) {
	if (!Number.isFinite(n)) return "Error";
	return Math.abs(n) >= 0xe8d4a51000 || Math.abs(n) > 0 && Math.abs(n) < 1e-8 ? n.toExponential(8) : String(Number(n.toPrecision(12)));
}
var tool = findCalculator("calculator");
var MAIN = [
	"C",
	"(",
	")",
	"÷",
	"7",
	"8",
	"9",
	"×",
	"4",
	"5",
	"6",
	"−",
	"1",
	"2",
	"3",
	"+",
	"0",
	".",
	"%",
	"="
];
var SCI = [
	"sin",
	"cos",
	"tan",
	"ln",
	"log",
	"sqrt",
	"π",
	"e",
	"^",
	"⌫"
];
function SciPage() {
	const [expr, setExpr] = (0, import_react.useState)("");
	const [display, setDisplay] = (0, import_react.useState)("0");
	const [error, setError] = (0, import_react.useState)(null);
	function apply(key) {
		setError(null);
		if (key === "C") {
			setExpr("");
			setDisplay("0");
			return;
		}
		if (key === "⌫") {
			const next = expr.slice(0, -1);
			setExpr(next);
			setDisplay(next || "0");
			return;
		}
		if (key === "=") {
			try {
				const out = formatResult(evaluate(expr || "0"));
				setDisplay(out);
				setExpr(out);
			} catch {
				setError("Invalid expression");
				setDisplay("Error");
			}
			return;
		}
		if (key === "%") {
			try {
				const out = formatResult(evaluate(expr || "0") / 100);
				setDisplay(out);
				setExpr(out);
			} catch {
				setError("Invalid expression");
			}
			return;
		}
		const next = expr + ({
			"÷": "/",
			"×": "*",
			"−": "-",
			sin: "sin(",
			cos: "cos(",
			tan: "tan(",
			ln: "ln(",
			log: "log(",
			sqrt: "sqrt(",
			π: "pi"
		}[key] ?? key);
		setExpr(next);
		setDisplay(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolPage, {
		tool,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mx-auto max-w-md shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 overflow-hidden rounded-lg border border-border bg-elevated p-4 text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-5 truncate font-mono text-xs text-muted",
							children: expr || " "
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-3xl font-bold tracking-tight tabular-nums",
							children: error ?? display
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2.5 grid grid-cols-5 gap-2",
						children: SCI.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, {
							label: k,
							onClick: () => apply(k),
							tone: "sci"
						}, k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-2.5",
						children: MAIN.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, {
							label: k,
							onClick: () => apply(k),
							tone: k === "=" ? "eq" : [
								"+",
								"−",
								"×",
								"÷"
							].includes(k) ? "op" : k === "C" ? "clear" : "num"
						}, k))
					})
				]
			})
		})
	});
}
function Key({ label, onClick, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("rounded-md border border-border py-3.5 font-mono text-sm font-semibold transition-transform active:scale-95", tone === "eq" && "bg-primary text-primary-fg", tone === "op" && "bg-primary/10 text-primary", tone === "clear" && "bg-danger/10 text-danger", tone === "sci" && "bg-elevated py-2.5 text-xs text-muted", tone === "num" && "hover:bg-elevated"),
		children: label
	});
}
//#endregion
export { SciPage as component };
