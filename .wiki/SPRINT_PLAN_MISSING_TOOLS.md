# CodePackr Finance – Sprint Plan: Missing Tools Implementation

> **Goal**: Fill the empty **Business & Valuation** category and add the highest-demand missing calculators in prioritized sprints.  
> **Last Updated**: 2026-09-10  
> **Status**: Ready for implementation

---

## Current Tool Inventory (as of 2026-09-10)

| Category              | Count | Tools |
|-----------------------|-------|-------|
| Loans & Debt          | 5     | EMI, Amortization, Prepayment, DTI, Simple Interest |
| Investments           | 5     | SIP, Lumpsum, CAGR, ROI, Compound Interest |
| Retirement & FIRE     | 5     | Retirement Corpus, Inflation, Future Value, Savings Goal, FIRE |
| Salary & In-Hand      | 3     | CTC to In-Hand, Salary Hike, Gratuity |
| Personal Finance      | 2     | Emergency Fund, Net Worth |
| Tax Planning          | 1     | Income Tax |
| **Business & Valuation** | **0** | — |

---

## Sprint Overview

| Sprint | Focus | Tools | Estimated Effort |
|--------|-------|-------|------------------|
| **Sprint 1** | Business & Valuation Foundation | NPV, IRR, Break-Even, Business Valuation (Multiples) | High |
| **Sprint 2** | Advanced Valuation + High-Traffic | DCF, WACC, Mortgage Affordability, Credit Card Payoff | High |
| **Sprint 3** | India + Startup Focus | GST, Capital Gains, HRA, Startup/SaaS Valuation, Burn Rate & Runway | Medium-High |
| **Sprint 4** | Nice-to-have / Polish | PPF/EPF/NPS, Rent vs Buy, Rule of 72, PV, Annuity, LTV:CAC, Markup vs Margin | Medium |

---

# SPRINT 1 – Business & Valuation Foundation

**Objective**: Populate the empty `business-finance` category with the 4 most essential and searchable tools.

### Tools to build
1. NPV Calculator
2. IRR Calculator
3. Break-Even Analysis Calculator
4. Business Valuation Calculator (EBITDA / Revenue / SDE Multiples)

---

## 1.1 NPV Calculator (Net Present Value)

### Product Spec
- **ID**: `npv-calculator`
- **Category**: `business-finance`
- **Name**: NPV Calculator (Net Present Value)
- **Description**: Calculate the net present value of a project or investment by discounting future cash flows at a chosen discount rate. Supports irregular cash flows and initial investment.
- **Keywords**: npv, net present value, capital budgeting, project evaluation, discounted cash flow, investment appraisal
- **Icon**: `Calculator` or `TrendingUp`
- **Popular**: true
- **isNew**: true

### Inputs
| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Initial Investment | number (currency) | 100000 | Cash outflow at t=0 (negative) |
| Discount Rate (% p.a.) | number | 10 | WACC or required rate of return |
| Cash Flows | dynamic list | [30000, 40000, 50000, 40000, 30000] | Year 1, Year 2 … (add/remove rows) |
| Compounding | select | Annual | Annual only for v1 |

### Outputs
- NPV (absolute)
- NPV Decision (Accept if NPV > 0)
- Present Value of each cash flow
- Total PV of inflows
- Profitability Index (optional)
- Simple chart: Cash flow timeline + cumulative PV

### Formula
```
NPV = -InitialInvestment + Σ (CFₜ / (1 + r)ᵗ)   for t = 1 to n
```

### Engine Location
`src/lib/financial/npv.ts`

### UI Pattern
Follow existing calculator style (see `RoiCalculatorView.tsx` or `CagrCalculatorView.tsx`):
- Left panel: inputs + dynamic cash-flow table
- Right panel: big NPV number + decision badge + breakdown table + simple bar/line chart

### Implementation Prompt (for coding agent)
```
Create a complete NPV Calculator for CodePackr Finance.

1. Add engine in src/lib/financial/npv.ts with pure functions:
   - calculateNPV({ initialInvestment, discountRate, cashFlows }): { npv, presentValues, totalPV, decision, profitabilityIndex }

2. Create view src/components/tools/NpvCalculatorView.tsx following the exact same structure, styling, and patterns as existing tools (CurrencyContext, ToolHeader, responsive layout, dark/light mode).

3. Register the tool in src/data/tools.ts under category 'business-finance'.

4. Add basic metadata entry in src/data/toolMetadata.json.

5. Support multi-currency via existing CurrencyContext.

6. Include unit tests in src/lib/financial/__tests__/npv.test.ts covering:
   - classic textbook example
   - zero cash flows
   - negative NPV
   - single period

Keep everything 100% client-side, no external APIs.
```

---

## 1.2 IRR Calculator (Internal Rate of Return)

### Product Spec
- **ID**: `irr-calculator`
- **Category**: `business-finance`
- **Name**: IRR Calculator (Internal Rate of Return)
- **Description**: Solve for the discount rate that makes the Net Present Value of a series of cash flows equal to zero. Useful for ranking projects and comparing against hurdle rates.
- **Keywords**: irr, internal rate of return, project return, capital budgeting, hurdle rate
- **Icon**: `Percent`
- **Popular**: true
- **isNew**: true

### Inputs
| Field | Type | Default |
|-------|------|---------|
| Initial Investment | currency | 100000 |
| Cash Flows | dynamic list | same as NPV |
| Guess Rate (optional) | number | 10% | for Newton-Raphson start |

### Outputs
- IRR (%)
- Comparison vs user-defined Hurdle Rate
- NPV at the calculated IRR (should be ≈ 0)
- Decision badge

### Formula
Solve for r in:
```
0 = -I₀ + Σ (CFₜ / (1 + r)ᵗ)
```
Use Newton-Raphson or bisection (pure JS, no external libs).

### Engine
`src/lib/financial/irr.ts`

### Implementation Prompt
```
Create IRR Calculator for CodePackr Finance.

1. Implement robust IRR solver in src/lib/financial/irr.ts (Newton-Raphson with fallback to bisection). Handle multiple sign changes gracefully (return first real positive root or clear error).

2. View: src/components/tools/IrrCalculatorView.tsx – same UX patterns as NPV.

3. Register in tools.ts (category: business-finance).

4. Unit tests covering:
   - Standard textbook IRR
   - No real root
   - All positive / all negative cash flows
   - High precision cases

Keep pure TypeScript, client-side only.
```

---

## 1.3 Break-Even Analysis Calculator

### Product Spec
- **ID**: `break-even-calculator`
- **Category**: `business-finance`
- **Name**: Break-Even Analysis Calculator
- **Description**: Calculate the number of units or revenue needed to cover fixed and variable costs. Includes contribution margin and margin of safety.
- **Keywords**: break even, break-even point, contribution margin, fixed cost, variable cost, margin of safety
- **Icon**: `Scale`
- **Popular**: true
- **isNew**: true

### Inputs
| Field | Type | Default |
|-------|------|---------|
| Fixed Costs | currency | 50000 |
| Variable Cost per Unit | currency | 30 |
| Selling Price per Unit | currency | 50 |
| Expected / Actual Units (optional) | number | 3000 | for margin of safety |

### Outputs
- Break-even Units
- Break-even Revenue
- Contribution Margin per Unit
- Contribution Margin Ratio (%)
- Margin of Safety (units & %)
- Profit at expected volume
- Simple cost-volume-profit chart (optional)

### Formula
```
Break-even Units = Fixed Costs / (Price – Variable Cost)
Break-even Revenue = Break-even Units × Price
Contribution Margin = Price – Variable Cost
```

### Engine
`src/lib/financial/breakEven.ts`

### Implementation Prompt
```
Create Break-Even Analysis Calculator.

1. Engine: src/lib/financial/breakEven.ts with clear pure functions.

2. View with large result cards + optional simple SVG/Canvas chart showing Fixed / Variable / Total cost lines vs Revenue.

3. Register under business-finance.

4. Tests for zero contribution margin (edge case), negative margins, etc.
```

---

## 1.4 Business Valuation Calculator (Multiples)

### Product Spec
- **ID**: `business-valuation-calculator`
- **Category**: `business-finance`
- **Name**: Business Valuation Calculator
- **Description**: Estimate business value using common multiples (Revenue, EBITDA, SDE). Includes industry preset ranges and low / mid / high scenarios.
- **Keywords**: business valuation, company valuation, ebitda multiple, revenue multiple, sde, seller discretionary earnings, exit value
- **Icon**: `BriefcaseBusiness`
- **Popular**: true
- **isNew**: true

### Inputs
| Field | Type | Notes |
|-------|------|-------|
| Valuation Method | select | Revenue / EBITDA / SDE |
| Financial Metric | currency | e.g. Annual Revenue or EBITDA or SDE |
| Multiple (Low / Base / High) | number | or use industry preset |
| Industry | select | SaaS, E-commerce, Services, Manufacturing, Other (optional presets) |
| Net Debt (optional) | currency | to convert Enterprise Value → Equity Value |

### Outputs
- Low / Base / High Valuation (Enterprise Value)
- Equity Value (if net debt provided)
- Implied multiple used
- Simple sensitivity note

### Suggested Industry Presets (2026 rough ranges)
- SaaS / Software: 4× – 12× Revenue
- E-commerce: 1.5× – 4× Revenue
- Professional Services: 3× – 6× SDE
- Manufacturing: 4× – 7× EBITDA
- Generic SMB: 2.5× – 5× SDE / EBITDA

### Engine
`src/lib/financial/businessValuation.ts`

### Implementation Prompt
```
Create Business Valuation Calculator using multiples method.

1. Engine supports Revenue, EBITDA, and SDE methods with low/base/high multiples.
2. Optional industry presets that auto-fill multiple ranges.
3. Convert EV to Equity Value when net debt is supplied.
4. Clean, professional UI with three result cards (Bear / Base / Bull).
5. Register in tools.ts + metadata.
6. Unit tests for each method.
```

---

# SPRINT 2 – Advanced Valuation + High-Traffic Tools

### Tools
5. Simple DCF Valuation Calculator  
6. WACC Calculator  
7. Mortgage Affordability / Home Loan Eligibility Calculator  
8. Credit Card Interest & Payoff Calculator  

---

## 2.1 Simple DCF Valuation Calculator

### Key Features
- Explicit forecast period (3–10 years)
- Free Cash Flow inputs (or simple growth from Year-1 FCF)
- Terminal value (Gordon Growth or Exit Multiple)
- Discount rate (WACC)
- Enterprise Value → Equity Value bridge (– Net Debt)

### Core Formula
```
EV = Σ (FCFₜ / (1+WACC)ᵗ) + TerminalValue / (1+WACC)ⁿ
```

### Prompt Summary
```
Build a clean, educational DCF calculator.
- User enters Year-1 FCF + growth rate or year-by-year FCFs
- Choose Terminal Value method: Gordon Growth or Exit Multiple
- Show full calculation table + sensitivity on WACC vs Terminal Growth
- Keep UI approachable (not a full 3-statement model)
```

---

## 2.2 WACC Calculator

### Inputs
- Cost of Equity (or Risk-free + Beta × ERP)
- Cost of Debt (pre-tax)
- Tax Rate
- Market Value of Equity
- Market Value of Debt

### Formula
```
WACC = (E/V) × Re + (D/V) × Rd × (1 – Tax)
```

---

## 2.3 Mortgage Affordability / Home Loan Eligibility

### Inputs
- Monthly income (gross / net)
- Existing EMIs / obligations
- Interest rate
- Tenure
- Desired down payment / property value
- FOIR / DTI limit (default 40–50%)

### Outputs
- Maximum affordable loan amount
- Maximum property value
- Estimated EMI
- FOIR used

---

## 2.4 Credit Card Interest & Payoff Calculator

### Inputs
- Outstanding balance
- Annual interest rate (APR)
- Minimum payment % or fixed amount
- Extra monthly payment

### Outputs
- Months to payoff
- Total interest paid
- Interest saved with extra payments
- Amortization-style schedule (optional)

---

# SPRINT 3 – India Focus + Startup Tools

### Tools
9. GST Calculator  
10. Capital Gains Tax Calculator (Equity / Property / Debt)  
11. HRA Exemption Calculator  
12. Startup / SaaS Valuation Calculator (ARR multiples + Rule of 40)  
13. Burn Rate & Runway Calculator  

---

## 3.1 GST Calculator
- Taxable value → CGST + SGST / IGST
- Reverse calculation (price inclusive of GST)
- Common rates: 0, 5, 12, 18, 28%

## 3.2 Capital Gains Tax Calculator
- Short-term vs Long-term
- Equity (STCG 20%, LTCG 12.5% above 1.25L – update with latest rules)
- Property / Debt / Other assets
- Indexation (if still applicable for some assets)

## 3.3 HRA Calculator
- Basic salary, HRA received, Rent paid, Metro / Non-metro
- Section 10(13A) exemption logic

## 3.4 Startup / SaaS Valuation
- ARR / MRR
- Growth rate
- Churn / NRR (optional)
- Rule of 40 score
- Industry multiple presets (SaaS, AI, Marketplace…)

## 3.5 Burn Rate & Runway
- Monthly cash burn
- Current cash balance
- Optional revenue / growth
- Months of runway + projected break-even

---

# SPRINT 4 – Remaining High-Value Tools

- PPF / EPF / NPS Calculators (India retirement instruments)
- Rent vs Buy Calculator
- Rule of 72
- Present Value (PV) Calculator
- Annuity Calculator
- LTV : CAC Calculator
- Markup vs Margin Calculator
- Dividend Yield Calculator
- Stock Average Calculator

---

## Shared Implementation Guidelines (All Sprints)

### File Structure (follow existing patterns)
```
src/lib/financial/<tool>.ts          ← pure calculation engine
src/lib/financial/__tests__/<tool>.test.ts
src/components/tools/<Tool>View.tsx  ← UI
src/data/tools.ts                    ← register ToolDef
src/data/toolMetadata.json           ← SEO / FAQ metadata
```

### Must Follow
- 100% client-side (no backend calls for calculations)
- Use existing `CurrencyContext` and formatting helpers
- Support dark / light theme via CSS variables
- Mobile-first responsive layout
- Accessible labels and keyboard navigation
- Clear “How it works” / formula explanation section
- Unit tests for core math (edge cases included)

### Registration Checklist for every new tool
1. Add entry to `TOOLS` array in `src/data/tools.ts`
2. Add corresponding metadata in `toolMetadata.json`
3. Add route / view mapping in `App.tsx` or the central calculator router
4. Update sitemap generation if needed
5. Add any new icons to `CodePackrIcons.tsx` if required

### Definition of Done (per tool)
- [ ] Engine + unit tests passing
- [ ] Full UI matching design system
- [ ] Multi-currency support
- [ ] Registered in tools.ts + metadata
- [ ] Works offline (PWA)
- [ ] Basic SEO title/description
- [ ] No console errors / TypeScript strict clean

---

## Suggested Next Action

**Start with Sprint 1** in this order:

1. NPV Calculator  
2. IRR Calculator  
3. Break-Even Analysis Calculator  
4. Business Valuation Calculator  

After Sprint 1 is live, the **Business & Valuation** category will no longer be empty and the product will have strong corporate-finance coverage.

---

*This document is the single source of truth for the missing-tools roadmap. Update the checkboxes and status as each tool is completed and merged.*
