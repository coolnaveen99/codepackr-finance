import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Cookie, FileCheck2, Scale, Shield, Target } from 'lucide-react';

export type TrustPageKey =
  | 'about'
  | 'financial-disclaimer'
  | 'cookie-policy'
  | 'calculation-methodology'
  | 'editorial-policy';

interface TrustPageViewProps {
  page: TrustPageKey;
  onBack: () => void;
}

type TrustPageContent = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
};

const PAGE_CONTENT: Record<TrustPageKey, TrustPageContent> = {
  about: {
    title: 'About CodePackr Finance',
    description: 'Transparent, browser-first financial tools for making clearer everyday decisions.',
    icon: Target,
    sections: [
      {
        heading: 'Our mission',
        paragraphs: [
          'CodePackr Finance helps people calculate, understand, compare, simulate, and plan without requiring an account for ordinary use. The tools are designed to make financial assumptions visible instead of hiding them behind a single headline number.',
        ],
        bullets: ['Free access to practical calculators', 'Clear assumptions and plain-language explanations', 'Useful comparisons instead of false certainty'],
      },
      {
        heading: 'Privacy by design',
        paragraphs: [
          'Calculator inputs and financial calculations run in your browser. We do not need a server-side copy of your income, loan balance, investment amount, or personal scenario to produce a result.',
          'Preferences such as theme, currency, and bookmarks may be stored in your browser using LocalStorage. Contact-form messages are the exception because they are intentionally submitted by you for support.',
        ],
      },
      {
        heading: 'How the platform is built',
        paragraphs: [
          'Each calculator separates input validation, a deterministic financial engine, analysis, and presentation. This makes formulas testable independently from the interface and keeps the same assumptions visible across result cards, tables, and exports.',
        ],
      },
    ],
  },
  'financial-disclaimer': {
    title: 'Financial Disclaimer',
    description: 'Important limits and assumptions for using CodePackr Finance calculations.',
    icon: Scale,
    sections: [
      {
        heading: 'General information only',
        paragraphs: [
          'CodePackr Finance provides educational estimates, not personal financial, investment, lending, insurance, accounting, or tax advice. Results depend on the information and assumptions entered and may not reflect your complete circumstances.',
        ],
      },
      {
        heading: 'Investment and retirement scenarios',
        paragraphs: [
          'Projected returns, retirement corpus estimates, SIP results, FIRE milestones, and inflation adjustments are illustrative scenarios. Actual returns, fees, taxes, inflation, liquidity, and market conditions can differ materially. Past performance is not a promise of future results.',
        ],
      },
      {
        heading: 'Loans and tax estimates',
        paragraphs: [
          'Loan outputs may differ from a lender statement because of fees, insurance, rate changes, rounding conventions, dates, and lender-specific rules. Tax outputs are estimates and should be checked against current official rules and a qualified tax professional before filing or making a decision.',
        ],
      },
      {
        heading: 'Before acting',
        paragraphs: ['Review the assumptions, methodology, and limitations for the relevant calculator. Seek advice from a licensed financial adviser, chartered accountant, lender, or other qualified professional for decisions that affect your finances.'],
        bullets: ['Do not treat an estimate as a guarantee', 'Verify current rates, laws, fees, and eligibility independently', 'Keep records of the assumptions used for important decisions'],
      },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    description: 'A plain-language explanation of cookies, browser storage, and optional support services.',
    icon: Cookie,
    sections: [
      {
        heading: 'What we use',
        paragraphs: ['CodePackr Finance does not require tracking or profiling cookies to run its calculators. Core calculations are available without signing in and without placing a behavioral advertising cookie.'],
        bullets: ['LocalStorage for theme, currency, and bookmarks', 'Service-worker cache for faster repeat visits and offline support', 'Temporary browser memory for the current calculator session'],
      },
      {
        heading: 'Optional communications',
        paragraphs: ['When you submit the contact form, the details you provide are sent to our configured support endpoint so we can respond. This is an intentional form submission, not background tracking, and calculator inputs are not included in it.'],
      },
      {
        heading: 'Your controls',
        paragraphs: ['You can clear LocalStorage and cached site data through your browser settings. Blocking storage may reset preferences or reduce offline functionality, but it does not change the calculation formulas.'],
      },
    ],
  },
  'calculation-methodology': {
    title: 'Calculation Methodology',
    description: 'How formulas are governed, tested, rounded, and presented across CodePackr Finance.',
    icon: FileCheck2,
    sections: [
      {
        heading: 'Formula governance',
        paragraphs: ['Every production calculator has a named formula engine, normalized inputs, explicit units, validation rules, and regression tests. UI components render the result model; they do not own the financial formula.'],
        bullets: ['Document the formula and its variables', 'Define compounding, payment timing, and period conventions', 'Handle zero, boundary, decimal, and invalid inputs explicitly', 'Review changes against known reference vectors'],
      },
      {
        heading: 'Rounding and presentation',
        paragraphs: ['Calculations retain full JavaScript number precision through the engine where practical. Currency values are formatted for display using the selected currency and appropriate decimal rules; displayed rounding must not silently become a different input to a later calculation.'],
      },
      {
        heading: 'Sources and limitations',
        paragraphs: ['General mathematical formulas are based on standard financial mathematics. Country-specific tax, statutory, and regulatory values require an effective date and should be verified against current official sources before use. A calculator result is only as reliable as the assumptions and rules supplied to it.'],
      },
    ],
  },
  'editorial-policy': {
    title: 'Editorial Policy',
    description: 'How financial explanations and rules are researched, reviewed, updated, and corrected.',
    icon: BookOpen,
    sections: [
      {
        heading: 'Research and review',
        paragraphs: ['We explain financial concepts in plain language and distinguish general education from professional advice. Formula changes, statutory references, and country-specific assumptions should be supported by reputable primary or professional sources before release.'],
        bullets: ['Prefer official government, regulator, lender, or standards sources', 'Record effective dates for rules that can change', 'Test formula changes before publishing them', 'Avoid promises about returns, savings, or approval'],
      },
      {
        heading: 'Updates',
        paragraphs: ['When a rule, assumption, or formula changes, the affected calculator documentation and tests should be updated together. The last reviewed date is shown where a page or rule depends on time-sensitive information.'],
      },
      {
        heading: 'Corrections',
        paragraphs: ['If you find an error, please contact us with the page URL, the inputs used, the observed result, and a source or reproducible explanation where available. We investigate material corrections, update the relevant content or formula, and add a regression test when the issue is reproducible.'],
      },
    ],
  },
};

export const TrustPageView: React.FC<TrustPageViewProps> = ({ page, onBack }) => {
  const content = PAGE_CONTENT[page];
  const Icon = content.icon;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold hover:underline cursor-pointer" style={{ color: 'var(--brand)' }}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Calculators</span>
      </button>

      <article className="p-6 sm:p-8 rounded-3xl border shadow-lg space-y-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}>
        <header className="border-b pb-6" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl text-white" style={{ backgroundColor: 'var(--brand)' }}><Icon className="w-5 h-5" /></span>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>{content.title}</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{content.description}</p>
          <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>Last reviewed: September 2026</p>
        </header>

        {content.sections.map((section) => (
          <section key={section.heading} className="space-y-3 text-xs sm:text-sm leading-relaxed">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}><CheckCircle2 className="w-4 h-4 text-emerald-500" />{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} style={{ color: 'var(--muted)' }}>{paragraph}</p>)}
            {section.bullets && <ul className="list-disc pl-5 space-y-1" style={{ color: 'var(--muted)' }}>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
          </section>
        ))}

        <div className="p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <Shield className="w-4 h-4 shrink-0 text-[var(--brand)] mt-0.5" />
          <span>CodePackr Finance is designed for transparent, client-side estimates. Review the full <a href="/privacy" className="font-semibold underline" style={{ color: 'var(--brand)' }}>Privacy Policy</a> and <a href="/terms" className="font-semibold underline" style={{ color: 'var(--brand)' }}>Terms</a> before relying on the service.</span>
        </div>
      </article>
    </div>
  );
};
