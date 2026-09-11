import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Scale, AlertOctagon, CheckCircle2, Lock, Building, FileText } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
  onContactClick: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({
  onBack,
  onContactClick,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold hover:underline cursor-pointer"
        style={{ color: 'var(--brand)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Calculators</span>
      </button>

      {/* Main Header & Tab Navigation */}
      <div
        className="p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl text-white" style={{ backgroundColor: 'var(--brand)' }}>
                {activeTab === 'privacy' ? <Shield className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
              </span>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service & Jurisdiction'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--muted)' }}>
              Last revised: September 2026 • CodePackr Finance Legal Counsel & Regulatory Compliance
            </p>
          </div>

          {/* Toggle Segmented Tabs */}
          <div className="flex rounded-xl border p-1 shrink-0" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'privacy' ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'terms' ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Terms &amp; Jurisdiction
            </button>
          </div>
        </div>

        {/* IMPORTANT NOTICE BANNER: EXCLUSIVE LEGAL FORUM */}
        <div
          className="p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 text-xs leading-relaxed"
          style={{
            backgroundColor: 'rgba(91, 82, 232, 0.06)',
            borderColor: 'var(--brand)',
            color: 'var(--ink)',
          }}
        >
          <AlertOctagon className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider block text-[11px] text-[var(--brand)]">
              Exclusive Territorial Jurisdiction &amp; Legal Ouster Clause
            </span>
            <p style={{ color: 'var(--ink)' }}>
              By accessing, browsing, or using the calculators on CodePackr Finance, you explicitly agree that any and all legal
              actions, disputes, claims, or arbitrations shall be instituted <strong>exclusively</strong> in the competent civil
              and criminal courts situated within the <strong>CodePackr Finance owner's native jurisdiction only</strong>. Jurisdiction of all other courts in India and worldwide is expressly ousted and barred.
            </p>
          </div>
        </div>

        {/* TAB 1: PRIVACY POLICY & DATA DISCLAIMER */}
        {activeTab === 'privacy' && (
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            <section className="space-y-3">
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <Lock className="w-4 h-4 text-emerald-500" />
                1. 100% Client-Side Sandbox &amp; Zero Server Ingestion
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                CodePackr Finance operates as a purely browser-executed, offline-capable suite of financial calculators. When you calculate
                loan EMIs, retirement projections, SIP returns, or investment growth, the entire computation is carried out locally on
                your machine via JavaScript (ECMAScript).
              </p>
              <ul className="list-disc pl-5 space-y-1" style={{ color: 'var(--muted)' }}>
                <li>Your financial figures, income details, and calculator inputs are <strong>never transmitted</strong> to CodePackr Finance servers.</li>
                <li>CodePackr Finance maintains <strong>no cloud databases, backend logs, or caching proxies</strong> for processed input.</li>
                <li>Once you close or refresh your browser tab, memory allocation for your inputs is instantaneously discarded by the browser.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <Building className="w-4 h-4 text-[var(--brand)]" />
                2. Financial Calculator &amp; Advisory Disclaimer
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                CodePackr Finance provides financial planning, loan, SIP, and investment calculators for informational and educational
                purposes only.
              </p>
              <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}>
                <span className="font-bold block text-xs" style={{ color: 'var(--ink)' }}>
                  Not Professional Financial, Investment, or Tax Advice:
                </span>
                <p style={{ color: 'var(--muted)' }}>
                  Calculator results are estimates based on the inputs and assumptions you provide (interest rates, tenure, contribution
                  frequency, expected returns, etc.) and do not account for taxes, fees, inflation variability, or your complete financial
                  situation. <strong>You acknowledge and accept that CodePackr Finance and its developers make no guarantee of accuracy and
                  bear no liability for financial decisions made based on these calculations.</strong>
                </p>
                <p style={{ color: 'var(--muted)' }}>
                  Please consult a licensed financial advisor, chartered accountant, or tax professional before making any actual financial,
                  investment, retirement, or loan decisions.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                3. Information We Collect (Minimalist Analytics &amp; Contact Webhooks)
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                CodePackr Finance does not track you with invasive identifiers. The only information processed includes:
              </p>
              <ul className="list-disc pl-5 space-y-1" style={{ color: 'var(--muted)' }}>
                <li>
                  <strong>Anonymous Traffic Telemetry:</strong> Standard non-personally identifiable metrics (pageviews, browser type, device category)
                  via Google Analytics 4 (Measurement ID: G-P9G4YRH6J4) and Microsoft Clarity (Project ID: ya1n0vs9s5) to identify rendering performance and broken links.
                </li>
                <li>
                  <strong>Feedback &amp; Inquiries:</strong> If you voluntarily reach out via our contact form, your name, email, and message
                  are securely transmitted directly to the owner's administrative inbox via Google Apps Script for customer support.
                </li>
                <li>
                  <strong>Local Storage Preferences:</strong> Your theme mode (light/dark), preferred currency, and bookmarked calculators are saved purely in your
                  browser's local storage and are never synchronized to our servers.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                4. Statutory Safe Harbor Under Information Technology Act, 2000
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                CodePackr Finance operates in compliance with Section 79 of the Information Technology Act, 2000 (India) and the Information
                Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. As CodePackr Finance does not initiate transmission,
                does not select the receiver, and does not select or modify information contained in the transmission, it is fully entitled
                to intermediary immunity and statutory safe harbor protection against third-party content.
              </p>
            </section>
          </div>
        )}

        {/* TAB 2: TERMS OF SERVICE, DISCLAIMERS & OUSTER JURISDICTION */}
        {activeTab === 'terms' && (
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            <section className="space-y-3">
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <FileText className="w-4 h-4 text-[var(--brand)]" />
                1. Acceptance of Terms &amp; Scope of Use
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                By accessing, using, or embedding CodePackr Finance (accessible via finance.codepackr.com and affiliated subdomains), you enter into
                a legally binding contract governed by the Indian Contract Act, 1872. If you do not consent to all terms, disclaimers,
                and jurisdictional mandates set forth herein, you are strictly prohibited from using this website and must discontinue
                use immediately.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
                2. Exclusive Forum Selection &amp; Absolute Jurisdiction Ouster Clause
              </h2>
              <div className="p-4 rounded-xl border space-y-3 bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200">
                <p className="font-semibold">
                  PLEASE READ THIS FORUM SELECTION CLAUSE CAREFULLY. IT GOVERNS HOW ALL LEGAL DISPUTES ARE RESOLVED:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Governing Law:</strong> These Terms, Disclaimers, and any dispute, controversy, or claim arising out of or in
                    connection with CodePackr Finance shall be governed exclusively by and construed in accordance with the substantive laws of
                    the Republic of India, without reference to conflict-of-law doctrines.
                  </li>
                  <li>
                    <strong>Exclusive Territorial Jurisdiction:</strong> Pursuant to Section 20 of the Code of Civil Procedure, 1908 (CPC),
                    the User and CodePackr Finance unequivocally agree that any claim, litigation, dispute, lawsuit, or arbitration arising out of,
                    affecting, or relating to CodePackr Finance, its developers, or its owner shall be instituted <strong>SOLEY AND EXCLUSIVELY</strong> in
                    the:
                    <div className="my-2 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800 font-mono text-xs font-bold text-center">
                      Competent Courts of CodePackr Finance Owner's Native Jurisdiction Only
                    </div>
                  </li>
                  <li>
                    <strong>Strict Ouster of All Other Courts:</strong> The jurisdiction of all other civil courts, High Courts (other than
                    the competent appellate High Court having territorial authority over the CodePackr Finance owner's native jurisdiction), consumer forums, and foreign or international tribunals
                    is <strong>EXPRESSLY OUSTED, BARRED, AND EXCLUDED</strong>.
                  </li>
                  <li>
                    <strong>Waiver of Inconvenient Forum:</strong> You irrevocably waive any objection which you may now or hereafter have to
                    the laying of venue of any proceeding in the competent courts of the CodePackr Finance owner's native jurisdiction, including any claim
                    of <em>forum non conveniens</em>.
                  </li>
                </ol>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                3. "As-Is" Warranty Disclaimer &amp; Strict Limitation of Liability
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                All financial calculators, formulas, and result outputs are provided on an
                <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranty of any kind, whether express, implied,
                statutory, or otherwise.
              </p>
              <ul className="list-disc pl-5 space-y-1.5" style={{ color: 'var(--muted)' }}>
                <li>CodePackr Finance makes no warranty that calculator outputs are accurate, complete, or suitable for your specific financial circumstances.</li>
                <li>
                  Under no circumstances shall the developer, owner, or operators of CodePackr Finance be held liable for any direct, indirect,
                  punitive, incidental, special, or consequential damages—including but not limited to financial losses, missed investment
                  opportunities, incorrect loan or retirement planning decisions, or any other monetary harm arising from reliance on calculator results.
                </li>
                <li>
                  In any event, the maximum aggregate legal liability of CodePackr Finance shall not exceed <strong>INR ₹100 (One Hundred Indian Rupees)</strong>.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                4. No Financial Advisory Relationship
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                Use of CodePackr Finance does not create a financial advisory, fiduciary, brokerage, or professional advisory relationship
                between you and CodePackr Finance. All financial terms, formulas, and calculation methods used (EMI, compound interest, SIP
                returns, retirement corpus projections, etc.) are standard, publicly available financial concepts and are not proprietary
                to CodePackr Finance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                5. Indemnification Clause
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                You agree to fully defend, indemnify, and hold harmless CodePackr Finance, its developer, owner, and agents from and against any claims,
                liabilities, damages, losses, costs, and expenses (including reasonable advocate and solicitor fees) arising from: (a) your use
                of CodePackr Finance; (b) any financial decisions made based on calculator outputs; or (c) your breach of these Terms.
              </p>
            </section>
          </div>
        )}

        {/* Footer Action */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>CodePackr Finance — Local, Private, In-Browser Calculations</span>
          </div>
          <button
            onClick={onContactClick}
            className="font-semibold text-[var(--brand)] hover:underline cursor-pointer"
          >
            Have legal or compliance queries? Contact Developer
          </button>
        </div>
      </div>
    </div>
  );
};