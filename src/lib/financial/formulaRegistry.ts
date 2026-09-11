/**
 * CodePackr Finance — Formula Governance & Registry
 * -------------------------------------------------
 * Standardized mathematical definitions, sources, assumptions,
 * limitations, and audit/review metadata for all financial models.
 *
 * Adheres to Phase 4 & Phase 5 of the CodePackr Finance Master Plan.
 */

export interface FormulaVariable {
  symbol: string;
  name: string;
  description: string;
  unit?: string;
}

export interface FormulaSource {
  title: string;
  publisher: string;
  url?: string;
  note?: string;
}

export interface FormulaDefinition {
  id: string;
  name: string;
  category: 'loans' | 'investments' | 'tax' | 'salary' | 'retirement' | 'personal-finance' | 'business-finance';
  formulaLatex: string;
  formulaText: string;
  description: string;
  variables: FormulaVariable[];
  assumptions: string[];
  limitations: string[];
  sources: FormulaSource[];
  version: string;
  lastReviewed: string;
  reviewedBy: string;
  reviewStatus: 'verified' | 'provisional' | 'draft';
}

export const FORMULA_REGISTRY: Record<string, FormulaDefinition> = {
  'simple-interest': {
    id: 'simple-interest',
    name: 'Simple (Non-Compounding) Interest Formula',
    category: 'investments',
    formulaLatex: 'I = \\frac{P \\times R \\times T}{100}, \\quad A = P + I',
    formulaText: 'Interest = (Principal * Annual Rate * Time in Years) / 100; Maturity Amount = Principal + Interest',
    description: 'Computes flat interest accrued strictly on the initial principal sum over a specified duration with zero reinvestment or compounding.',
    variables: [
      { symbol: 'P', name: 'Principal', description: 'Initial deposit or borrowed amount', unit: 'currency' },
      { symbol: 'R', name: 'Interest Rate', description: 'Annual percentage interest rate', unit: '% per annum' },
      { symbol: 'T', name: 'Tenure', description: 'Loan or deposit duration', unit: 'years' },
      { symbol: 'I', name: 'Accrued Interest', description: 'Total simple interest earned or owed', unit: 'currency' },
      { symbol: 'A', name: 'Maturity Amount', description: 'Sum of principal and total accrued interest', unit: 'currency' },
    ],
    assumptions: [
      'Interest rate remains static throughout the entire tenure.',
      'No compounding or mid-term reinvestment of earned interest takes place.',
      'Time is calculated proportionally on a 365-day annual basis.',
    ],
    limitations: [
      'Does not account for inflation erosion of purchasing power.',
      'Does not apply to bank fixed deposits that compound quarterly or annually.',
    ],
    sources: [
      { title: 'Standard Financial Mathematics & Banking Textbook', publisher: 'Chartered Institute of Bankers' },
      { title: 'RBI Master Directions on Interest Rate on Advances', publisher: 'Reserve Bank of India', url: 'https://www.rbi.org.in' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'loan-emi': {
    id: 'loan-emi',
    name: 'Equated Monthly Installment (EMI) Reducing Balance Formula',
    category: 'loans',
    formulaLatex: 'EMI = P \\times r \\times \\frac{(1 + r)^n}{(1 + r)^n - 1}',
    formulaText: 'EMI = Principal * r * (1 + r)^n / ((1 + r)^n - 1), where r = AnnualRate / (12 * 100)',
    description: 'Computes the uniform monthly payment required to amortize a loan over a set number of months on a monthly reducing balance method.',
    variables: [
      { symbol: 'P', name: 'Principal Loan Amount', description: 'Sanctioned loan borrowing amount', unit: 'currency' },
      { symbol: 'r', name: 'Monthly Interest Rate', description: 'Annual interest rate divided by 12 and 100', unit: 'decimal/month' },
      { symbol: 'n', name: 'Tenure in Months', description: 'Total number of monthly installments', unit: 'months' },
      { symbol: 'EMI', name: 'Monthly Installment', description: 'Fixed monthly outflow covering principal and interest', unit: 'currency/month' },
    ],
    assumptions: [
      'Interest is calculated on the reducing principal balance at the beginning of each monthly payment cycle.',
      'Interest rate remains fixed throughout the loan tenure unless explicitly floating.',
      'Payments occur uniformly at the end of each calendar month.',
    ],
    limitations: [
      'Does not include one-time processing charges, document verification fees, stamp duty, or foreclosure penalties.',
      'Floating rate loans will adjust installments or duration upon benchmark reset.',
    ],
    sources: [
      { title: 'Standard Amortization Methodology', publisher: 'Financial Industry Regulatory Authority (FINRA)' },
      { title: 'Indian Banks Association (IBA) Retail Lending Best Practices', publisher: 'IBA' },
    ],
    version: '1.1.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'sip': {
    id: 'sip',
    name: 'Systematic Investment Plan (SIP) Annuity Due Formula',
    category: 'investments',
    formulaLatex: 'M = P \\times \\frac{(1 + i)^n - 1}{i} \\times (1 + i)',
    formulaText: 'Maturity = MonthlyDeposit * [((1 + i)^n - 1) / i] * (1 + i), where i = AnnualReturn / (12 * 100)',
    description: 'Calculates the future accumulated corpus from periodic monthly contributions invested at the start of each month under regular compounding.',
    variables: [
      { symbol: 'P', name: 'Monthly Installment', description: 'Periodic amount invested every month', unit: 'currency' },
      { symbol: 'i', name: 'Periodic Monthly Return', description: 'Annual expected CAGR return divided by 12 and 100', unit: 'decimal/month' },
      { symbol: 'n', name: 'Total Installments', description: 'Number of monthly contributions (Years * 12)', unit: 'months' },
      { symbol: 'M', name: 'Maturity Corpus', description: 'Gross accumulated wealth at completion', unit: 'currency' },
    ],
    assumptions: [
      'Returns are assumed to compound uniformly every month at the indicated expected rate.',
      'Investments are made on the first day of each calendar month (Annuity Due).',
      'All dividends and interest proceeds are 100% reinvested without interim distributions.',
    ],
    limitations: [
      'Equity markets do not deliver constant geometric returns; actual NAV trajectory exhibits volatility and drawdown cycles.',
      'Taxes (such as Long-Term Capital Gains LTCG) and mutual fund expense ratios (TER) are not subtracted.',
    ],
    sources: [
      { title: 'Association of Mutual Funds in India (AMFI) Investor Guidelines', publisher: 'AMFI India', url: 'https://www.amfiindia.com' },
      { title: 'Principles of Corporate Finance (Brealey, Myers, Allen)', publisher: 'McGraw-Hill Education' },
    ],
    version: '1.1.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'compound-interest': {
    id: 'compound-interest',
    name: 'Compound Interest with Periodic Contributions',
    category: 'investments',
    formulaLatex: 'A = P \\left(1 + \\frac{r}{n}\\right)^{nt} + PMT \\times \\frac{\\left(1 + \\frac{r}{n}\\right)^{nt} - 1}{r/n}',
    formulaText: 'Future Value = P * (1 + r/n)^(n*t) + PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]',
    description: 'Determines the future balance of an initial deposit compounded n times per year with optional ongoing contributions.',
    variables: [
      { symbol: 'P', name: 'Initial Principal', description: 'Starting sum invested', unit: 'currency' },
      { symbol: 'r', name: 'Nominal Annual Rate', description: 'Stated annual interest rate in decimal form', unit: 'decimal' },
      { symbol: 'n', name: 'Compounding Frequency', description: 'Compounding cycles per year (1=annual, 4=quarterly, 12=monthly, 365=daily)', unit: 'frequency/year' },
      { symbol: 't', name: 'Time Horizon', description: 'Duration of investment', unit: 'years' },
      { symbol: 'PMT', name: 'Periodic Deposit', description: 'Additional deposit made every cycle', unit: 'currency' },
      { symbol: 'A', name: 'Accrued Future Balance', description: 'Total accumulated balance', unit: 'currency' },
    ],
    assumptions: [
      'Interest earned in each sub-period is credited and compounds immediately.',
      'Nominal interest rate remains constant across all compounding cycles.',
    ],
    limitations: [
      'Tax withholding on interest (TDS) is not deducted at each compounding checkpoint.',
    ],
    sources: [
      { title: 'Federal Reserve Regulation DD — Truth in Savings Act', publisher: 'Federal Reserve Board' },
      { title: 'Compound Interest Formula Documentation', publisher: 'Investopedia Financial Review' },
    ],
    version: '1.1.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'cagr': {
    id: 'cagr',
    name: 'Compound Annual Growth Rate (CAGR)',
    category: 'investments',
    formulaLatex: 'CAGR = \\left( \\frac{V_{final}}{V_{begin}} \\right)^{\\frac{1}{t}} - 1',
    formulaText: 'CAGR = ((Final Value / Beginning Value) ^ (1 / Tenure in Years)) - 1',
    description: 'Calculates the smoothed geometric annualized rate of return that would take an investment from its initial value to its terminal value.',
    variables: [
      { symbol: 'V_begin', name: 'Beginning Value', description: 'Starting investment value', unit: 'currency' },
      { symbol: 'V_final', name: 'Ending Value', description: 'Terminal realized or current portfolio value', unit: 'currency' },
      { symbol: 't', name: 'Tenure in Years', description: 'Elapsed time period in fractional years', unit: 'years' },
      { symbol: 'CAGR', name: 'Annual Growth Rate', description: 'Annualized geometric return rate', unit: '%' },
    ],
    assumptions: [
      'No cash inflows or outflows occurred between the beginning and ending dates.',
      'Tenure t must be greater than zero.',
    ],
    limitations: [
      'Masks historical volatility; two investments with identical CAGR may have drastically different risk profiles and max drawdowns.',
      'Not suitable if intermediate deposits or withdrawals were executed (use XIRR / Money-Weighted Return instead).',
    ],
    sources: [
      { title: 'GIPS (Global Investment Performance Standards)', publisher: 'CFA Institute' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'inflation': {
    id: 'inflation',
    name: 'Purchasing Power & Inflation Adjustment Formula',
    category: 'personal-finance',
    formulaLatex: 'FV = PV \\times (1 + i)^n, \\quad PP = \\frac{PV}{(1 + i)^n}',
    formulaText: 'Future Cost = Present Cost * (1 + i)^n; Future Purchasing Power = Current Savings / (1 + i)^n',
    description: 'Determines the escalation of future expenses and the real erosion of static cash reserves over time given a constant inflation rate.',
    variables: [
      { symbol: 'PV', name: 'Present Value', description: 'Current nominal cost or savings sum', unit: 'currency' },
      { symbol: 'i', name: 'Inflation Rate', description: 'Annual general inflation percentage in decimal form', unit: 'decimal' },
      { symbol: 'n', name: 'Time Horizon', description: 'Time elapsed', unit: 'years' },
      { symbol: 'FV', name: 'Future Cost', description: 'Amount required in the future to purchase the same basket of goods', unit: 'currency' },
      { symbol: 'PP', name: 'Real Purchasing Power', description: 'Equivalent value of today’s savings in future purchasing power', unit: 'currency' },
    ],
    assumptions: [
      'Inflation rate compounds annually at a static average rate.',
      'Individual lifestyle basket inflation tracks aggregate CPI.',
    ],
    limitations: [
      'Healthcare and educational costs consistently experience higher sectoral inflation than headline CPI.',
    ],
    sources: [
      { title: 'Consumer Price Index Manual: Concepts and Methods', publisher: 'International Labour Organization / IMF / World Bank' },
      { title: 'RBI Monetary Policy Framework & Inflation Targeting', publisher: 'Reserve Bank of India' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'emergency-fund': {
    id: 'emergency-fund',
    name: 'Essential Reserves & Emergency Liquidity Requirement',
    category: 'personal-finance',
    formulaLatex: 'Fund_{target} = \\sum (E_{essential}) \\times M_{coverage}',
    formulaText: 'Target Emergency Fund = Monthly Mandatory Essential Expenses * Number of Coverage Months',
    description: 'Computes the recommended liquid emergency buffer necessary to absorb catastrophic events (job loss, medical emergency, sudden repairs) without liquidating long-term investments or incurring high-interest debt.',
    variables: [
      { symbol: 'E_essential', name: 'Monthly Essentials', description: 'Core non-discretionary expenses (rent, food, EMI, utilities, premiums)', unit: 'currency/month' },
      { symbol: 'M_coverage', name: 'Coverage Months', description: 'Duration buffer (typically 3-6 months salaried, 9-12 months freelancer/business)', unit: 'months' },
      { symbol: 'Fund_target', name: 'Required Emergency Fund', description: 'Recommended target capital held in high-liquidity instruments', unit: 'currency' },
    ],
    assumptions: [
      'Discretionary expenses (dining out, subscriptions, luxury vacations) are paused during a financial shock.',
      'Emergency fund is parked in capital-safe, instant-access accounts (high-yield savings, sweep-in FD, overnight liquid funds).',
    ],
    limitations: [
      'High inflation may necessitate annual recalibration of the emergency reserve.',
    ],
    sources: [
      { title: 'Financial Planning Standards Board (FPSB) Guidelines on Liquidity Management', publisher: 'FPSB' },
      { title: 'SEBI Investor Education and Protection Guidelines', publisher: 'Securities and Exchange Board of India' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'net-worth': {
    id: 'net-worth',
    name: 'Net Worth & Solvency Calculation',
    category: 'personal-finance',
    formulaLatex: 'NW = \\sum (Assets_{liquid} + Assets_{invested} + Assets_{real}) - \\sum (Liabilities_{secured} + Liabilities_{unsecured})',
    formulaText: 'Net Worth = Total Realizable Assets - Total Outstanding Liabilities',
    description: 'Measures total personal financial solvency by tallying fair market value of all assets minus all current and long-term liabilities.',
    variables: [
      { symbol: 'Assets', name: 'Total Assets', description: 'Sum of liquid cash, equity, retirement accounts, precious metals, and real estate', unit: 'currency' },
      { symbol: 'Liabilities', name: 'Total Liabilities', description: 'Outstanding balances of mortgages, auto loans, personal loans, and credit card dues', unit: 'currency' },
      { symbol: 'NW', name: 'Net Worth', description: 'Total economic equity owned free and clear', unit: 'currency' },
    ],
    assumptions: [
      'Asset valuations reflect realistic fair market liquidation value rather than initial purchase price.',
      'Encumbrances on pledged assets are fully represented in liabilities.',
    ],
    limitations: [
      'Physical illiquid assets (e.g. self-occupied home) cannot be rapidly deployed for emergency cash flow.',
    ],
    sources: [
      { title: 'Personal Financial Statements (AICPA Accounting Standards)', publisher: 'American Institute of CPAs' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'roi': {
    id: 'roi',
    name: 'Return on Investment (ROI) & Annualized Efficiency',
    category: 'business-finance',
    formulaLatex: 'ROI = \\frac{V_{net}}{Cost_{initial}} \\times 100, \\quad ROI_{ann} = \\left(1 + \\frac{ROI}{100}\\right)^{\\frac{1}{t}} - 1',
    formulaText: 'ROI (%) = ((Final Value - Initial Cost) / Initial Cost) * 100; Annualized ROI = ((1 + Total ROI / 100) ^ (1 / Tenure)) - 1',
    description: 'Measures the profitability efficiency of an investment relative to its initial capital outlay.',
    variables: [
      { symbol: 'Cost_initial', name: 'Initial Outlay', description: 'Total capital invested initially', unit: 'currency' },
      { symbol: 'V_net', name: 'Net Profit', description: 'Terminal value plus cash payouts minus initial outlay', unit: 'currency' },
      { symbol: 'ROI', name: 'Total Return', description: 'Percentage gain or loss on initial capital', unit: '%' },
      { symbol: 'ROI_ann', name: 'Annualized ROI', description: 'Compound annual performance rate', unit: '%' },
    ],
    assumptions: [
      'All realized gains, dividends, or coupon distributions are accounted for.',
    ],
    limitations: [
      'Absolute ROI ignores the holding duration; 50% ROI over 1 year is dramatically superior to 50% ROI over 10 years.',
    ],
    sources: [
      { title: 'Principles of Managerial Finance', publisher: 'Pearson Education' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'fire': {
    id: 'fire',
    name: 'Financial Independence, Retire Early (FIRE) Target Formula',
    category: 'retirement',
    formulaLatex: 'Corpus_{FIRE} = \\frac{Expenses_{annual}}{SWR}, \\quad SWR \\approx 4\\% \\implies Corpus = 25 \\times Expenses_{annual}',
    formulaText: 'FIRE Target Corpus = Annual Living Expenses * (100 / Safe Withdrawal Rate)',
    description: 'Determines the minimum capital base required to sustain perpetual living expenses without exhausting the principal, grounded in the Bengen 4% Trinity study rule adjusted for extended retirement horizons.',
    variables: [
      { symbol: 'Expenses_annual', name: 'Annual Expenses', description: 'Projected annual cost of living in retirement', unit: 'currency/year' },
      { symbol: 'SWR', name: 'Safe Withdrawal Rate', description: 'Percentage of corpus withdrawn in year 1 and inflation-adjusted thereafter (typically 3.0% - 4.0%)', unit: '%' },
      { symbol: 'Corpus_FIRE', name: 'FIRE Corpus', description: 'Required accumulated capital to declare financial freedom', unit: 'currency' },
    ],
    assumptions: [
      'Portfolio maintains an asset allocation divided between equity indices and debt/fixed income securities.',
      'Annual withdrawals adjust upward matching headline inflation.',
    ],
    limitations: [
      'Early retirees (retiring at age 30-40) face 50+ year horizons where sequence-of-returns risk can necessitate a lower SWR (e.g. 3.25% - 3.5%).',
    ],
    sources: [
      { title: 'Determining Withdrawal Rates Using Historical Data (William Bengen, 1994)', publisher: 'Journal of Financial Planning' },
      { title: 'Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable (Trinity Study, Cooley et al., 1998)', publisher: 'AAII Journal' },
    ],
    version: '1.1.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'debt-to-income': {
    id: 'debt-to-income',
    name: 'Debt-to-Income (DTI) Ratio Formula',
    category: 'loans',
    formulaLatex: 'DTI_{back} = \\frac{\\sum Debt_{monthly}}{Income_{gross\\_monthly}} \\times 100',
    formulaText: 'Back-End DTI (%) = (Total Monthly Debt Obligations / Gross Monthly Income) * 100',
    description: 'Measures monthly debt servicing liabilities as a percentage of gross pre-tax income, utilized by mortgage lenders to assess borrowing capacity and default risk.',
    variables: [
      { symbol: 'Income_gross_monthly', name: 'Gross Monthly Income', description: 'Total monthly earnings before taxes', unit: 'currency' },
      { symbol: 'Debt_monthly', name: 'Total Monthly Debt', description: 'Sum of housing, auto, student, and card payments', unit: 'currency' },
      { symbol: 'DTI', name: 'DTI Ratio', description: 'Ratio of monthly debt to gross income', unit: '%' },
    ],
    assumptions: [
      'Income is recurring and verifiable for lending purposes.',
      'Only minimum required debt installments are counted.',
    ],
    limitations: [
      'Does not account for non-debt recurring living expenses like food, healthcare, and utilities.',
    ],
    sources: [
      { title: 'Consumer Financial Protection Bureau (CFPB) DTI Guidelines', publisher: 'CFPB' },
      { title: 'Fannie Mae Selling Guide: Debt-to-Income Ratios', publisher: 'Fannie Mae' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'loan-prepayment': {
    id: 'loan-prepayment',
    name: 'Loan Prepayment & Interest Savings Formula',
    category: 'loans',
    formulaLatex: 'B_{t} = B_{t-1} \\times (1 + r) - (EMI + Prepayment_t)',
    formulaText: 'New Balance = Previous Balance * (1 + monthly rate) - (Regular EMI + Extra Principal Prepayment)',
    description: 'Computes accelerated debt amortization where extra payments reduce outstanding principal directly, saving compound interest and shaving months off loan tenor.',
    variables: [
      { symbol: 'Prepayment', name: 'Extra Principal', description: 'Additional payment applied directly to principal', unit: 'currency' },
      { symbol: 'Interest_Saved', name: 'Total Interest Saved', description: 'Difference between baseline and accelerated interest', unit: 'currency' },
    ],
    assumptions: [
      'Prepayments are credited directly to principal with zero prepayment penalty.',
      'Interest continues to be charged on daily or monthly reducing balance.',
    ],
    limitations: [
      'Some commercial or private fixed-rate loans carry prepayment lock-in periods or penalties.',
    ],
    sources: [
      { title: 'Handbook of Mortgage-Backed Securities', publisher: 'McGraw-Hill' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'loan-amortization': {
    id: 'loan-amortization',
    name: 'Reducing Balance Loan Amortization Schedule',
    category: 'loans',
    formulaLatex: 'I_t = B_{t-1} \\times r, \\quad P_t = EMI - I_t, \\quad B_t = B_{t-1} - P_t',
    formulaText: 'Interest_t = Balance_(t-1) * monthly rate; Principal_t = EMI - Interest_t; Balance_t = Balance_(t-1) - Principal_t',
    description: 'Generates detailed periodic breakdown of how each fixed EMI payment splits into interest servicing and principal reduction over time.',
    variables: [
      { symbol: 'EMI', name: 'Equated Monthly Installment', description: 'Fixed monthly payment', unit: 'currency' },
      { symbol: 'P_t', name: 'Principal Paid', description: 'Portion reducing debt balance', unit: 'currency' },
      { symbol: 'I_t', name: 'Interest Paid', description: 'Cost of borrowing for the period', unit: 'currency' },
    ],
    assumptions: [
      'Fixed interest rate and uniform monthly payments.',
    ],
    limitations: [
      'Does not model floating rate resets or reset spreads without manual schedule adjustment.',
    ],
    sources: [
      { title: 'The Mathematics of Financial Modeling & Investment Management', publisher: 'Wiley Finance' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'lumpsum': {
    id: 'lumpsum',
    name: 'Lumpsum Investment Compounding Formula',
    category: 'investments',
    formulaLatex: 'FV = PV \\times (1 + r)^n',
    formulaText: 'Future Value = Lumpsum Principal * (1 + annual return rate)^years',
    description: 'Determines the future accumulated wealth of a single upfront capital deployment subjected to compound annual geometric expansion.',
    variables: [
      { symbol: 'PV', name: 'Initial Lumpsum', description: 'Starting capital invested', unit: 'currency' },
      { symbol: 'r', name: 'Annual Return', description: 'Compounded annual growth expectation', unit: '%' },
      { symbol: 'n', name: 'Years', description: 'Holding period', unit: 'years' },
    ],
    assumptions: [
      'Returns are reinvested continuously without annual taxation or liquidation.',
    ],
    limitations: [
      'Market volatility means real-world equities do not compound linearly year over year.',
    ],
    sources: [
      { title: 'A Random Walk Down Wall Street (Burton Malkiel)', publisher: 'W. W. Norton & Company' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'future-value': {
    id: 'future-value',
    name: 'Time Value of Money (TVM) Future Value Formula',
    category: 'retirement',
    formulaLatex: 'FV = PV(1 + \\frac{r}{m})^{mt} + PMT \\left[\\frac{(1 + \\frac{r}{m})^{mt} - 1}{\\frac{r}{m}}\\right]',
    formulaText: 'FV = PV * (1 + r/m)^(m*t) + PMT * [((1 + r/m)^(m*t) - 1) / (r/m)]',
    description: 'Standard financial economics formula for projecting the future cash worth of a current asset base combined with regular periodic contributions under discrete compounding.',
    variables: [
      { symbol: 'PV', name: 'Present Value', description: 'Current cash asset or balance', unit: 'currency' },
      { symbol: 'PMT', name: 'Payment', description: 'Periodic recurring deposit amount', unit: 'currency' },
      { symbol: 'm', name: 'Frequency', description: 'Compounding periods per year', unit: 'periods' },
      { symbol: 't', name: 'Time', description: 'Total investment duration', unit: 'years' },
    ],
    assumptions: [
      'Contributions are made consistently without missed installments.',
      'Discount rate or nominal yield is held constant.',
    ],
    limitations: [
      'Ignores transaction fees, platform charges, and capital gains tax drag.',
    ],
    sources: [
      { title: 'Corporate Finance (Ross, Westerfield, Jaffe)', publisher: 'McGraw-Hill' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'savings-goal': {
    id: 'savings-goal',
    name: 'Savings Goal Required Contribution Formula',
    category: 'retirement',
    formulaLatex: 'PMT = \\frac{FV - PV(1 + r)^n}{\\frac{(1 + r)^n - 1}{r}}',
    formulaText: 'Required Monthly Savings = (Target Goal - PV*(1+r)^n) / [((1+r)^n - 1) / r]',
    description: 'Computes the periodic savings required to bridge the gap between existing seed capital and a future targeted financial purchase or milestone.',
    variables: [
      { symbol: 'FV', name: 'Target Goal', description: 'Desired future corpus amount', unit: 'currency' },
      { symbol: 'PMT', name: 'Required Monthly Deposit', description: 'Amount to set aside each month', unit: 'currency/month' },
    ],
    assumptions: [
      'Deposits occur at regular monthly intervals.',
    ],
    limitations: [
      'Inflation can increase the future cost of the underlying target item if not indexed.',
    ],
    sources: [
      { title: 'Personal Finance (Garman & Forgue)', publisher: 'Cengage Learning' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'salary-hike': {
    id: 'salary-hike',
    name: 'Salary Hike & Increment Percentage Formula',
    category: 'salary',
    formulaLatex: 'Hike\\% = \\frac{Salary_{new} - Salary_{current}}{Salary_{current}} \\times 100, \\quad Real\\% = \\frac{1 + Hike\\%}{1 + Inflation\\%} - 1',
    formulaText: 'Percentage Hike = ((New Salary - Current Salary) / Current Salary) * 100',
    description: 'Calculates compensation delta across annual and monthly intervals, evaluating real wage growth against benchmark inflation.',
    variables: [
      { symbol: 'Salary_current', name: 'Current Salary', description: 'Baseline annual or monthly salary', unit: 'currency' },
      { symbol: 'Salary_new', name: 'New Salary', description: 'Updated compensation package', unit: 'currency' },
      { symbol: 'Hike%', name: 'Percentage Hike', description: 'Nominal percentage raise', unit: '%' },
    ],
    assumptions: [
      'Compensation numbers represent fixed gross pay or equivalent CTC basis.',
    ],
    limitations: [
      'Higher tax brackets can reduce the percentage of take-home hike compared to gross hike.',
    ],
    sources: [
      { title: 'Compensation Management in a Knowledge-Based World', publisher: 'Prentice Hall' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'gratuity': {
    id: 'gratuity',
    name: 'Gratuity Calculation Formula (Payment of Gratuity Act, 1972)',
    category: 'salary',
    formulaLatex: 'Gratuity = \\frac{15 \\times Salary_{basic+DA} \\times Tenure_{years}}{26}',
    formulaText: 'Gratuity = (15 * (Last Drawn Monthly Basic + DA) * Completed Years of Service) / 26',
    description: 'Statutory terminal employee benefit payable upon separation after 5 or more years of continuous service under the Payment of Gratuity Act, 1972 (India).',
    variables: [
      { symbol: 'Salary_basic+DA', name: 'Last Drawn Basic + DA', description: 'Last drawn monthly basic pay plus dearness allowance', unit: 'currency/month' },
      { symbol: 'Tenure_years', name: 'Tenure', description: 'Completed years of service (rounded up if > 6 months under Act)', unit: 'years' },
    ],
    assumptions: [
      'Employee has completed at least 5 years of continuous service (except in death/disablement).',
      'Calculated based on 26 working days per month for covered organizations.',
    ],
    limitations: [
      'Statutory tax-free ceiling is currently capped at ₹20,00,000 under Section 10(10) of the Income-tax Act, 1961.',
    ],
    sources: [
      { title: 'The Payment of Gratuity Act, 1972 (Act No. 39 of 1972)', publisher: 'Ministry of Labour and Employment, Govt. of India' },
      { title: 'Section 10(10) Income-tax Act, 1961', publisher: 'Central Board of Direct Taxes (CBDT)' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-03-01',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'npv': {
    id: 'npv',
    name: 'Net Present Value (NPV) Formula',
    category: 'business-finance',
    formulaLatex: 'NPV = -I_0 + \\sum_{t=1}^{n} \\frac{CF_t}{(1 + r)^t}',
    formulaText: 'NPV = -InitialInvestment + Sum(CF_t / (1 + r)^t) for t = 1 to n',
    description: 'Measures the excess or shortfall of cash inflows, in present value terms, over the initial capital outlay required to fund an investment.',
    variables: [
      { symbol: 'I_0', name: 'Initial Investment', description: 'Upfront cash outlay at t=0', unit: 'currency' },
      { symbol: 'CF_t', name: 'Cash Flow at Year t', description: 'Net cash inflow or outflow generated in period t', unit: 'currency' },
      { symbol: 'r', name: 'Discount Rate', description: 'Weighted Average Cost of Capital (WACC) or required rate of return', unit: '%' },
      { symbol: 't', name: 'Time Period', description: 'Time horizon in discrete years', unit: 'years' },
    ],
    assumptions: [
      'Cash flows occur discretely at the end of each annual period.',
      'Cash inflows can be reinvested continuously at the specified discount rate (cost of capital).',
      'The discount rate remains uniform throughout the project lifecycle.',
    ],
    limitations: [
      'Relies heavily on accurate long-term cash flow forecasting and discount rate precision.',
      'Does not inherently account for non-financial project synergies or managerial real options.',
    ],
    sources: [
      { title: 'Principles of Corporate Finance', publisher: 'Brealey, Myers, Allen (McGraw-Hill)' },
      { title: 'Corporate Finance: Theory and Practice', publisher: 'Aswath Damodaran (John Wiley & Sons)' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-09-11',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'irr': {
    id: 'irr',
    name: 'Internal Rate of Return (IRR) Formula',
    category: 'business-finance',
    formulaLatex: '0 = -I_0 + \\sum_{t=1}^{n} \\frac{CF_t}{(1 + IRR)^t}',
    formulaText: 'Solve for IRR where NPV(IRR) = 0: 0 = -InitialInvestment + Sum(CF_t / (1 + IRR)^t)',
    description: 'The annualized effective compounded discount rate that equates the Net Present Value of all future cash flows from an investment to zero.',
    variables: [
      { symbol: 'IRR', name: 'Internal Rate of Return', description: 'The breakeven rate of return of the capital project', unit: '%' },
      { symbol: 'I_0', name: 'Initial Investment', description: 'Upfront cash outlay at t=0', unit: 'currency' },
      { symbol: 'CF_t', name: 'Cash Flow at Year t', description: 'Net periodic cash inflow at year t', unit: 'currency' },
    ],
    assumptions: [
      'Cash inflows generated over the life of the project are reinvested at the IRR itself (which can be optimistic vs WACC).',
      'Conventional cash flow stream (one net outflow followed by net positive inflows).',
    ],
    limitations: [
      'Unconventional cash flows with multiple sign switches can yield multiple mathematical IRRs or no real solution.',
      'Does not account for project scale when comparing mutually exclusive capital investments.',
    ],
    sources: [
      { title: 'Valuation: Measuring and Managing the Value of Companies', publisher: 'McKinsey & Company (Wiley)' },
      { title: 'Financial Management: Theory & Practice', publisher: 'Eugene F. Brigham & Michael C. Ehrhardt' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-09-11',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'break-even': {
    id: 'break-even',
    name: 'Break-Even Analysis & Contribution Margin Formula',
    category: 'business-finance',
    formulaLatex: 'Q_{BE} = \\frac{FC}{P - VC}, \\quad CM\\% = \\frac{P - VC}{P} \\times 100',
    formulaText: 'Break-Even Units = Fixed Costs / (Selling Price - Variable Cost per Unit)',
    description: 'Calculates the sales volume in units or currency required to cover total operational fixed and variable costs with zero net profit or loss.',
    variables: [
      { symbol: 'FC', name: 'Fixed Costs', description: 'Overhead costs that remain unchanged regardless of output volume (rent, salaries, licenses)', unit: 'currency' },
      { symbol: 'VC', name: 'Variable Cost per Unit', description: 'Direct costs incurred per additional unit produced or sold (materials, shipping, commissions)', unit: 'currency/unit' },
      { symbol: 'P', name: 'Selling Price per Unit', description: 'Gross sale price charged to customers per unit', unit: 'currency/unit' },
      { symbol: 'Q_BE', name: 'Break-Even Quantity', description: 'Minimum number of units to sell to achieve net zero operating profit', unit: 'units' },
    ],
    assumptions: [
      'Selling price and variable cost per unit remain linear across all production volumes.',
      'All output produced within the accounting period is sold (no fluctuating inventory stockpile).',
      'Fixed costs remain static within the relevant operational range.',
    ],
    limitations: [
      'Does not account for economies of scale, quantity discounts, or stepped fixed overheads.',
      'Assumes a single-product model unless an aggregated weighted average contribution margin is used.',
    ],
    sources: [
      { title: 'Managerial Accounting: Creating Value in a Dynamic Business Environment', publisher: 'Ronald W. Hilton (McGraw-Hill)' },
      { title: 'Cost Accounting: A Managerial Emphasis', publisher: 'Horngren, Datar, Rajan (Pearson)' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-09-11',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },

  'business-valuation': {
    id: 'business-valuation',
    name: 'Business Valuation Multiples Formula',
    category: 'business-finance',
    formulaLatex: 'EV = Metric \\times Multiple, \\quad EquityValue = EV - NetDebt',
    formulaText: 'Enterprise Value = Financial Metric (Revenue / EBITDA / SDE) * Multiple; Equity Value = Enterprise Value - Net Debt',
    description: 'Estimates enterprise and equity fair market value using market-comparable transaction multiples applied to normalized operational metrics.',
    variables: [
      { symbol: 'Metric', name: 'Operational Metric', description: 'Normalized Revenue, EBITDA, or Seller Discretionary Earnings (SDE)', unit: 'currency' },
      { symbol: 'Multiple', name: 'Valuation Multiple', description: 'Market transaction multiple benchmark based on industry, margin, and growth profile', unit: 'multiple (x)' },
      { symbol: 'EV', name: 'Enterprise Value', description: 'Total operating economic value of the business enterprise', unit: 'currency' },
      { symbol: 'NetDebt', name: 'Net Debt', description: 'Total interest-bearing debt minus available cash and liquid equivalents', unit: 'currency' },
      { symbol: 'EquityValue', name: 'Equity Value', description: 'Net residual economic value attributable to equity shareholders/owners', unit: 'currency' },
    ],
    assumptions: [
      'Financial metrics reflect normalized, recurring operational earnings without non-recurring owner perks or one-time windfalls.',
      'Comparable peer multiple ranges reflect current prevailing M&A transaction benchmarks.',
    ],
    limitations: [
      'Multiples method does not capture long-term company-specific competitive moats or structural capital expenditure requirements.',
      'Market multiples fluctuate across macroeconomic interest rate cycles.',
    ],
    sources: [
      { title: 'Damodaran on Valuation: Security Analysis for Investment and Corporate Finance', publisher: 'Aswath Damodaran (John Wiley & Sons)' },
      { title: 'Middle Market M&A: Handbook for Investment Banking and Business Consulting', publisher: 'Marks, Sleight, Robbins (Wiley)' },
    ],
    version: '1.0.0',
    lastReviewed: '2026-09-11',
    reviewedBy: 'CodePackr Financial Engineering Working Group',
    reviewStatus: 'verified',
  },
};

/**
 * Retrieve formula definition by ID
 */
export function getFormulaDefinition(formulaId: string): FormulaDefinition | undefined {
  return FORMULA_REGISTRY[formulaId];
}
