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
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold hover:underline cursor-pointer"
        style={{ color: 'var(--brand)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Calculators</span>
      </button>

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
              Last revised: September 2026 • CodePackr Finance
            </p>
          </div>

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
              Governing Law &amp; Venue
            </span>
            <p style={{ color: 'var(--ink)' }}>
              By using CodePackr Finance, you agree that disputes relating to these services will be handled under the laws of India
              and resolved in the competent courts of the operator&apos;s principal place of business, unless applicable consumer
              or mandatory local law provides otherwise.
            </p>
          </div>
        </div>

        {activeTab === 'privacy' && (
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            <section className="space-y-3">
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <Lock className="w-4 h-4 text-emerald-500" />
                1. 100% Client-Side Calculations
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                CodePackr Finance runs calculators entirely in your browser. Inputs and results are not uploaded to our servers.
              </p>
            </section>
            <section className="space-y-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                2. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-1" style={{ color: 'var(--muted)' }}>
                <li><strong>Anonymous analytics</strong> (e.g. page views) via standard tools such as Google Analytics.</li>
                <li><strong>Contact messages</strong> you send voluntarily.</li>
                <li><strong>Local preferences</strong> (theme, bookmarks) stored only in your browser.</li>
              </ul>
            </section>
            <section className="space-y-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                3. Not Financial Advice
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                Results are educational estimates only and are not investment, tax, or legal advice. Verify with a qualified professional before making decisions.
              </p>
            </section>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            <section className="space-y-3">
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                <FileText className="w-4 h-4 text-[var(--brand)]" />
                1. Acceptance of Terms
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                By using CodePackr Finance you agree to these terms. If you do not agree, discontinue use.
              </p>
            </section>
            <section className="space-y-3">
              <h2 className="text-base font-bold text-[color:var(--ink)]">
                2. Governing Law &amp; Dispute Resolution
              </h2>
              <div className="p-4 rounded-xl border space-y-3 bg-[color:var(--surface-elevated)] border-[color:var(--border)] text-[color:var(--ink)]">
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Governing Law:</strong> These Terms are governed by the laws of India.</li>
                  <li><strong>Preferred venue:</strong> Subject to mandatory consumer and other non-waivable laws, disputes are intended to be resolved in the competent courts of the operator&apos;s principal place of business.</li>
                  <li><strong>Other forums:</strong> Other courts&apos; jurisdiction is limited except where mandatory law requires otherwise.</li>
                </ol>
              </div>
            </section>
            <section className="space-y-3">
              <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                3. Disclaimer &amp; Limitation of Liability
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                Tools are provided &quot;as is&quot; without warranties. Maximum aggregate liability shall not exceed INR ₹100.
              </p>
            </section>
          </div>
        )}

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>CodePackr Finance — Private, Browser-Based Calculators</span>
          </div>
          <button onClick={onContactClick} className="font-semibold text-[var(--brand)] hover:underline cursor-pointer">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};
