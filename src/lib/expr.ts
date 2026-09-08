/** Tiny expression evaluator for the scientific calculator. No eval(). */

function tokenize(src: string): string[] {
  const out: string[] = [];
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

type Parser = {
  tokens: string[];
  i: number;
};

function peek(p: Parser) {
  return p.tokens[p.i];
}
function eat(p: Parser, expected?: string) {
  const t = p.tokens[p.i];
  if (expected && t !== expected) throw new Error("Invalid expression");
  p.i += 1;
  return t;
}

function parseExpr(p: Parser): number {
  let v = parseTerm(p);
  while (peek(p) === "+" || peek(p) === "-") {
    const op = eat(p);
    const r = parseTerm(p);
    v = op === "+" ? v + r : v - r;
  }
  return v;
}

function parseTerm(p: Parser): number {
  let v = parsePower(p);
  while (peek(p) === "*" || peek(p) === "/") {
    const op = eat(p);
    const r = parsePower(p);
    v = op === "*" ? v * r : v / r;
  }
  return v;
}

function parsePower(p: Parser): number {
  const v = parseUnary(p);
  if (peek(p) === "^") {
    eat(p);
    return Math.pow(v, parsePower(p));
  }
  return v;
}

function parseUnary(p: Parser): number {
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

function parsePrimary(p: Parser): number {
  const t = peek(p);
  if (t === undefined) throw new Error("Incomplete expression");
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
  const fns: Record<string, (x: number) => number> = {
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
    exp: Math.exp,
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

export function evaluate(expression: string): number {
  const p: Parser = { tokens: tokenize(expression), i: 0 };
  if (p.tokens.length === 0) return 0;
  const v = parseExpr(p);
  if (p.i !== p.tokens.length) throw new Error("Invalid expression");
  if (!Number.isFinite(v)) throw new Error("Not a finite number");
  return v;
}

export function formatResult(n: number) {
  if (!Number.isFinite(n)) return "Error";
  const rounded = Math.abs(n) >= 1e12 || (Math.abs(n) > 0 && Math.abs(n) < 1e-8) ? n.toExponential(8) : String(Number(n.toPrecision(12)));
  return rounded;
}
