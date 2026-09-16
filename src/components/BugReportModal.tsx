import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bug,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Mail,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Loader2,
  Calculator,
  Flame,
  Layout,
  Coins,
  Lightbulb,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import {
  collectDiagnostics,
  formatDiagnosticsMarkdown,
  buildBugReportMailto,
  IssueType,
  ISSUE_TYPE_LABELS,
  BugReportFormValues,
  BugReportModalDetail,
  SystemDiagnostics,
} from '../lib/diagnostics';
import { useCurrency } from '../lib/CurrencyContext';
import { safeLocalStorage } from '../lib/storage';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BugReportModalDetail | null;
}

const DEFAULT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxLtRspOxZaKhGdikBBlAjJk3ndSibOs0t3Im2Xf-K0podjAPItb90iOA9mDjRAbuT_Bg/exec';

const ISSUE_TYPES: Array<{
  type: IssueType;
  label: string;
  icon: React.FC<{ className?: string }>;
  hint: string;
}> = [
  {
    type: 'calculation_error',
    label: 'Calculation Error / Discrepancy',
    icon: Calculator,
    hint: 'Amortization, compounding frequency, or formula mismatch',
  },
  {
    type: 'unexpected_error_nan',
    label: 'Unexpected Error / NaN / Crash',
    icon: Flame,
    hint: 'Screen froze, calculation output is NaN or Infinity',
  },
  {
    type: 'ui_chart_glitch',
    label: 'UI / Chart / Table Layout Glitch',
    icon: Layout,
    hint: 'Broken charts, responsiveness wrapping, or table clipping',
  },
  {
    type: 'currency_formatting',
    label: 'Currency / Formatting Issue',
    icon: Coins,
    hint: 'Incorrect currency symbol, decimal rounding, or locale issue',
  },
  {
    type: 'feature_request',
    label: 'Feature Request / Suggestion',
    icon: Lightbulb,
    hint: 'New financial metric, scenario comparison, or feature idea',
  },
];

export const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { currencyCode, symbol } = useCurrency();

  // Form State
  const [issueType, setIssueType] = useState<IssueType>('calculation_error');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [includeSanitizedParams, setIncludeSanitizedParams] = useState(true);

  // UI state
  const [showDiagnosticsPreview, setShowDiagnosticsPreview] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hidden form ref for reliable cross-browser dual-dispatch
  const hiddenFormRef = useRef<HTMLFormElement>(null);

  // Sync initialData when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmittedTicketId(null);
      setValidationError(null);
      setCopiedMarkdown(false);
      setCopiedTicket(false);
      setShowDiagnosticsPreview(false);

      if (initialData?.issueType) {
        setIssueType(initialData.issueType);
      } else {
        setIssueType('calculation_error');
      }

      if (initialData?.initialSummary) {
        setSummary(initialData.initialSummary);
      } else if (initialData?.tool) {
        setSummary(`Discrepancy in ${initialData.tool.name}`);
      } else {
        setSummary('');
      }

      if (initialData?.initialError) {
        setDescription(`Observed runtime error:\n${initialData.initialError}`);
      } else {
        setDescription('');
      }
      setStepsToReproduce('');
      setExpectedResult('');
      setActualResult('');
    }
  }, [isOpen, initialData]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // System diagnostics calculation (recomputed when includeSanitizedParams or tool context changes)
  const diagnostics: SystemDiagnostics = useMemo(() => {
    return collectDiagnostics({
      tool: initialData?.tool,
      inputsSnapshot: initialData?.inputsSnapshot,
      outputsSnapshot: initialData?.outputsSnapshot,
      currencyCode,
      currencySymbol: symbol,
      includeSanitizedParams,
    });
  }, [initialData, currencyCode, symbol, includeSanitizedParams, isOpen]);

  // Compiled Markdown Report
  const currentFormValues: BugReportFormValues = {
    ticketId: diagnostics.ticketId,
    issueType,
    summary: summary || 'Unspecified Issue',
    description: description || 'No detailed description provided',
    stepsToReproduce: stepsToReproduce.trim() || undefined,
    expectedResult: expectedResult.trim() || undefined,
    actualResult: actualResult.trim() || undefined,
    reporterName: reporterName.trim() || undefined,
    reporterEmail: reporterEmail.trim() || undefined,
    includeSanitizedParams,
  };

  const markdownReport = useMemo(() => {
    return formatDiagnosticsMarkdown(diagnostics, currentFormValues);
  }, [diagnostics, currentFormValues]);

  if (!isOpen) return null;

  // Handle Copy to Clipboard
  const handleCopyMarkdown = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(markdownReport);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = markdownReport;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2500);
    } catch (err) {
      console.error('Failed to copy markdown to clipboard', err);
    }
  };

  const handleCopyTicket = async (ticketId: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(ticketId);
      }
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    } catch {}
  };

  // Handle Send via Email fallback
  const handleSendEmail = () => {
    const mailto = buildBugReportMailto(
      diagnostics.ticketId,
      summary || 'CodePackr Finance Issue',
      markdownReport
    );
    window.location.href = mailto;
  };

  // Handle Full Submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedSummary = summary.trim();
    const trimmedDesc = description.trim();

    if (!trimmedSummary) {
      setValidationError('Please provide a brief one-line summary headline for this issue.');
      return;
    }

    if (trimmedSummary.length < 5) {
      setValidationError('Summary headline is too brief. Please enter at least 5 characters.');
      return;
    }

    if (!trimmedDesc) {
      setValidationError('Please explain what happened or describe the discrepancy in detail.');
      return;
    }

    setIsSubmitting(true);
    const assignedTicketId = diagnostics.ticketId;

    try {
      // 1. Persist to local storage audit log
      try {
        const existing = JSON.parse(safeLocalStorage.getItem('codepackr_reported_issues') || '[]');
        existing.unshift({
          ticketId: assignedTicketId,
          timestamp: new Date().toISOString(),
          issueType,
          summary: trimmedSummary,
          toolId: diagnostics.tool?.id || 'site-wide',
        });
        safeLocalStorage.setItem('codepackr_reported_issues', JSON.stringify(existing.slice(0, 30)));
      } catch {}

      // 2. Dispatch payload via Google Apps Script endpoint / webhook
      const targetUrl =
        (import.meta.env.VITE_CONTACT_GOOGLE_SCRIPT_URL as string) || DEFAULT_ENDPOINT;

      const params = new URLSearchParams();
      params.append('name', reporterName.trim() || 'Anonymous User');
      params.append('email', reporterEmail.trim() || 'no-reply@codepackr.com');
      params.append('subject', `[${assignedTicketId}] [${issueType}] ${trimmedSummary}`);
      params.append(
        'message',
        `${trimmedDesc}\n\n---\nFull Markdown Diagnostics:\n${markdownReport}`
      );
      params.append('category', 'Bug Report');
      params.append('timestamp', new Date().toISOString());

      // Dual-dispatch: fetch + hidden form submission for 100% iframe/adblock resilience
      if (hiddenFormRef.current) {
        hiddenFormRef.current.action = targetUrl;
        const nameInput = hiddenFormRef.current.elements.namedItem('name') as HTMLInputElement;
        const emailInput = hiddenFormRef.current.elements.namedItem('email') as HTMLInputElement;
        const subjectInput = hiddenFormRef.current.elements.namedItem('subject') as HTMLInputElement;
        const messageInput = hiddenFormRef.current.elements.namedItem('message') as HTMLTextAreaElement;

        if (nameInput) nameInput.value = reporterName.trim() || 'Anonymous User';
        if (emailInput) emailInput.value = reporterEmail.trim() || 'no-reply@codepackr.com';
        if (subjectInput) subjectInput.value = `[${assignedTicketId}] [${issueType}] ${trimmedSummary}`;
        if (messageInput) {
          messageInput.value = `${trimmedDesc}\n\n---\nFull Markdown Diagnostics:\n${markdownReport}`;
        }

        try {
          hiddenFormRef.current.submit();
        } catch {}
      }

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }).catch(() => null);

      // Brief transition delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 350));
      setSubmittedTicketId(assignedTicketId);
    } catch (err) {
      console.warn('Bug report submission network notice:', err);
      // Even if network fails, present the user with the generated ticket ID & fallback options
      setSubmittedTicketId(assignedTicketId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="bug-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-report-title"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--line)',
          color: 'var(--ink)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[color:var(--border)] shrink-0 bg-[color:var(--surface-elevated)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 shadow-xs shrink-0">
              <Bug className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 id="bug-report-title" className="text-base sm:text-lg font-bold tracking-tight text-[color:var(--ink)]">
                {submittedTicketId ? 'Report Submitted' : 'Report Issue or Calculation Bug'}
              </h2>
              <p className="text-xs text-[color:var(--ink-muted)]">
                {diagnostics.tool
                  ? `Diagnostics targeted for: ${diagnostics.tool.name}`
                  : 'Site-wide diagnostics & client telemetry'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface)] transition-colors cursor-pointer border border-transparent hover:border-[color:var(--border)]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-6 flex-1 custom-scrollbar">
          {submittedTicketId ? (
            /* SUCCESS STATE */
            <div className="text-center py-6 sm:py-8 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-xl font-extrabold text-[color:var(--ink)]">
                  Thank You for Helping Improve CodePackr Finance!
                </h3>
                <p className="text-sm text-[color:var(--ink-muted)] leading-relaxed">
                  Your bug report and technical telemetry have been dispatched. Our engineering team reviews all calculation reports against formal financial formulas.
                </p>
              </div>

              {/* Ticket Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-xs">
                <span className="text-xs font-semibold text-[color:var(--ink-muted)] uppercase tracking-wider">
                  Ticket Reference:
                </span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {submittedTicketId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyTicket(submittedTicketId)}
                  className="p-1 rounded-md text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface)] transition-colors cursor-pointer"
                  title="Copy ticket reference"
                >
                  {copiedTicket ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Action Buttons in Success View */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:border-emerald-500 transition-all shadow-xs cursor-pointer"
                >
                  {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedMarkdown ? 'Report Copied to Clipboard!' : 'Copy Markdown Report'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:border-emerald-500 transition-all shadow-xs cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-emerald-500" />
                  <span>Send Backup via Email</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm cursor-pointer"
                >
                  Done &amp; Close
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE FORM STATE */
            <form id="bug-report-form" onSubmit={handleSubmitReport} className="space-y-6">
              {/* Validation Alert */}
              {validationError && (
                <div className="p-3.5 rounded-xl text-xs sm:text-sm bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{validationError}</span>
                </div>
              )}

              {/* 1. Issue Type & Severity Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--ink-muted)]">
                  Issue Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ISSUE_TYPES.map((item) => {
                    const Icon = item.icon;
                    const isSelected = issueType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setIssueType(item.type)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                            : 'border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--brand)]/50'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`block text-xs font-bold leading-tight ${
                              isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-[color:var(--ink)]'
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="block text-[11px] text-[color:var(--ink-muted)] line-clamp-1 mt-0.5">
                            {item.hint}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. One-line Summary */}
              <div className="space-y-1.5">
                <label htmlFor="bug-summary-input" className="block text-xs font-bold uppercase tracking-wider text-[color:var(--ink-muted)]">
                  Summary Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  id="bug-summary-input"
                  type="text"
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Loan EMI interest rounding differs from bank schedule by 1.2%"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* 3. What happened & Expected Result */}
              <div className="space-y-1.5">
                <label htmlFor="bug-desc-input" className="block text-xs font-bold uppercase tracking-wider text-[color:var(--ink-muted)]">
                  What Happened &amp; Expected Output <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="bug-desc-input"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the discrepancy clearly. What input numbers did you enter, what did the calculator show, and what did you expect it to calculate?"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors leading-relaxed"
                />
              </div>

              {/* 4. Steps to Reproduce & Expected vs Actual (Collapsible / Optional Inputs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="bug-steps-input" className="block text-xs font-bold uppercase tracking-wider text-[color:var(--ink-muted)]">
                    Steps to Reproduce (Optional)
                  </label>
                  <textarea
                    id="bug-steps-input"
                    rows={2}
                    value={stepsToReproduce}
                    onChange={(e) => setStepsToReproduce(e.target.value)}
                    placeholder="1. Set Principal to 500,000&#10;2. Choose 8.5% interest&#10;3. Click Monthly compounding"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label htmlFor="bug-expected-input" className="block text-xs font-bold uppercase tracking-wider text-[color:var(--ink-muted)]">
                      Expected Value (Optional)
                    </label>
                    <input
                      id="bug-expected-input"
                      type="text"
                      value={expectedResult}
                      onChange={(e) => setExpectedResult(e.target.value)}
                      placeholder="e.g. $4,328.50 monthly payment"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="bug-actual-input" className="block text-xs font-bold uppercase tracking-wider text-[color:var(--ink-muted)]">
                      Actual Observed (Optional)
                    </label>
                    <input
                      id="bug-actual-input"
                      type="text"
                      value={actualResult}
                      onChange={(e) => setActualResult(e.target.value)}
                      placeholder="e.g. $4,390.10 or NaN"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Optional Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[color:var(--border)]">
                <div className="space-y-1">
                  <label htmlFor="bug-reporter-name" className="block text-xs font-semibold text-[color:var(--ink-muted)]">
                    Your Name (Optional)
                  </label>
                  <input
                    id="bug-reporter-name"
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="bug-reporter-email" className="block text-xs font-semibold text-[color:var(--ink-muted)]">
                    Your Email (Optional, for resolution updates)
                  </label>
                  <input
                    id="bug-reporter-email"
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="e.g. jane@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* 6. Financial Privacy & Sanitization Guarantee Checkbox */}
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSanitizedParams}
                    onChange={(e) => setIncludeSanitizedParams(e.target.checked)}
                    className="mt-0.5 rounded-sm border-[color:var(--border)] text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                  />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-[color:var(--ink)] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Include sanitized calculation parameters in diagnostic report
                    </span>
                    <p className="text-[11px] text-[color:var(--ink-muted)] leading-relaxed">
                      {includeSanitizedParams
                        ? 'Attaches calculation inputs (e.g., tenure, interest rate, principal) so developers can accurately reproduce the mathematical edge case. Zero banking credentials or personal identification data are ever collected.'
                        : '🔒 Full numerical masking active: All numerical inputs will be masked as [REDACTED] in the attached telemetry report.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* 7. Expandable Technical Diagnostics Accordion */}
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDiagnosticsPreview((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[color:var(--ink)] hover:bg-[color:var(--surface)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[color:var(--ink-muted)]" />
                    <span>View Technical Telemetry &amp; System Specs</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--border)] text-[color:var(--ink-muted)]">
                      {diagnostics.recentErrors.length} errors logged
                    </span>
                  </div>
                  {showDiagnosticsPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDiagnosticsPreview && (
                  <div className="p-4 border-t border-[color:var(--border)] space-y-3 bg-[color:var(--surface)] text-xs animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-[color:var(--surface-elevated)]">
                        <span className="text-[color:var(--ink-muted)] block">Browser</span>
                        <span className="font-bold text-[color:var(--ink)]">
                          {diagnostics.client.browserName} {diagnostics.client.browserVersion}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[color:var(--surface-elevated)]">
                        <span className="text-[color:var(--ink-muted)] block">OS / Device</span>
                        <span className="font-bold text-[color:var(--ink)]">
                          {diagnostics.client.os} ({diagnostics.client.deviceType})
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[color:var(--surface-elevated)]">
                        <span className="text-[color:var(--ink-muted)] block">Viewport</span>
                        <span className="font-bold text-[color:var(--ink)]">
                          {diagnostics.client.viewportDimensions}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[color:var(--surface-elevated)]">
                        <span className="text-[color:var(--ink-muted)] block">Currency</span>
                        <span className="font-bold text-[color:var(--ink)]">
                          {diagnostics.financialContext.currencyCode} ({diagnostics.financialContext.currencySymbol})
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[color:var(--surface-elevated)]">
                        <span className="text-[color:var(--ink-muted)] block">Timezone</span>
                        <span className="font-bold text-[color:var(--ink)]">
                          {diagnostics.client.timezone}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[color:var(--surface-elevated)]">
                        <span className="text-[color:var(--ink-muted)] block">Network</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {diagnostics.app.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    {diagnostics.financialContext.inputsSnapshot && (
                      <div>
                        <span className="font-bold text-[11px] text-[color:var(--ink-muted)] block mb-1">
                          Captured Parameters ({diagnostics.financialContext.isRedacted ? 'Masked' : 'Sanitized'}):
                        </span>
                        <pre className="p-2.5 rounded-lg bg-[color:var(--surface-elevated)] border border-[color:var(--border)] overflow-x-auto text-[10px] font-mono text-[color:var(--ink)] leading-snug">
                          {JSON.stringify(diagnostics.financialContext.inputsSnapshot, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!submittedTicketId && (
          <div className="px-5 sm:px-6 py-4 border-t border-[color:var(--border)] bg-[color:var(--surface-elevated)] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:border-emerald-500 transition-colors shadow-2xs cursor-pointer"
                title="Copy entire formatted markdown to clipboard for GitHub or Slack"
              >
                {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMarkdown ? 'Copied Markdown' : 'Copy Markdown'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:border-emerald-500 transition-colors shadow-2xs cursor-pointer"
                title="Send pre-filled report via email client"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>Send via Email</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="bug-report-form"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Hidden fallback form for iframe dual-dispatch */}
        <form
          ref={hiddenFormRef}
          method="POST"
          target="bug-report-silent-target"
          style={{ display: 'none' }}
        >
          <input type="hidden" name="name" />
          <input type="hidden" name="email" />
          <input type="hidden" name="subject" />
          <textarea name="message" defaultValue="" />
          <input type="hidden" name="category" value="Bug Report" />
        </form>
        <iframe
          name="bug-report-silent-target"
          title="silent-bug-target"
          style={{ display: 'none', width: 0, height: 0, border: 'none' }}
        />
      </div>
    </div>
  );
};
