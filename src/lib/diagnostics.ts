import { ToolDef } from '../types';
import { TOOL_ID_TO_CANONICAL_SLUG } from './urls';

export interface RecordedError {
  timestamp: string;
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
}

export interface ToolDiagnosticInfo {
  id: string;
  name: string;
  category: string;
  slug: string;
  canonicalUrl: string;
}

export interface FinancialContextInfo {
  currencyCode: string;
  currencySymbol: string;
  conversionMode?: string;
  localizedFormatSample: string;
  inputsSnapshot?: Record<string, any>;
  outputsSnapshot?: Record<string, any>;
  isRedacted: boolean;
}

export interface ClientDiagnosticInfo {
  browserName: string;
  browserVersion: string;
  userAgent: string;
  os: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  screenResolution: string;
  viewportDimensions: string;
  devicePixelRatio: number;
  language: string;
  timezone: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
}

export interface AppDiagnosticInfo {
  appVersion: string;
  timestamp: string;
  localTime: string;
  urlPath: string;
  theme: 'light' | 'dark';
  online: boolean;
}

export interface SystemDiagnostics {
  ticketId: string;
  tool?: ToolDiagnosticInfo;
  financialContext: FinancialContextInfo;
  client: ClientDiagnosticInfo;
  app: AppDiagnosticInfo;
  recentErrors: RecordedError[];
}

export type IssueType =
  | 'calculation_error'
  | 'unexpected_error_nan'
  | 'ui_chart_glitch'
  | 'currency_formatting'
  | 'feature_request';

export interface BugReportFormValues {
  ticketId: string;
  issueType: IssueType;
  summary: string;
  description: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  reporterName?: string;
  reporterEmail?: string;
  includeSanitizedParams: boolean;
}

export interface BugReportModalDetail {
  tool?: ToolDef;
  inputsSnapshot?: Record<string, any>;
  outputsSnapshot?: Record<string, any>;
  issueType?: IssueType;
  initialSummary?: string;
  initialError?: string;
}

// -------------------------------------------------------------
// 1. In-memory circular buffer for runtime errors (last 5)
// -------------------------------------------------------------
const MAX_RECORDED_ERRORS = 5;
const errorBuffer: RecordedError[] = [];

export function recordRuntimeDiagnosticError(message: string, error?: unknown, source?: string, lineno?: number, colno?: number): void {
  const stack = error instanceof Error ? error.stack : typeof error === 'string' ? error : undefined;
  const entry: RecordedError = {
    timestamp: new Date().toISOString(),
    message: String(message || 'Unknown runtime error'),
    source,
    lineno,
    colno,
    stack: stack ? stack.split('\n').slice(0, 4).join('\n') : undefined,
  };

  errorBuffer.unshift(entry);
  if (errorBuffer.length > MAX_RECORDED_ERRORS) {
    errorBuffer.pop();
  }
}

export function getRecentErrors(): RecordedError[] {
  return [...errorBuffer];
}

export function clearRecentErrors(): void {
  errorBuffer.length = 0;
}

// Auto-attach browser error listeners safely
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    try {
      recordRuntimeDiagnosticError(
        event.message,
        event.error,
        event.filename,
        event.lineno,
        event.colno
      );
    } catch {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      const msg = reason instanceof Error ? reason.message : String(reason || 'Unhandled Promise Rejection');
      recordRuntimeDiagnosticError(`Unhandled Promise Rejection: ${msg}`, reason);
    } catch {}
  });
}

// -------------------------------------------------------------
// 2. Ticket ID Generator: FIN-BUG-YYYYMMDD-XXXX
// -------------------------------------------------------------
export function generateTicketId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FIN-BUG-${year}${month}${day}-${randomSuffix}`;
}

// -------------------------------------------------------------
// 3. Client & Environment Detectors
// -------------------------------------------------------------
function detectBrowser(ua: string): { name: string; version: string } {
  if (/firefox\/(\d+(\.\d+)*)/i.test(ua)) {
    const match = ua.match(/firefox\/(\d+(\.\d+)*)/i);
    return { name: 'Firefox', version: match ? match[1] : '' };
  }
  if (/edg\/(\d+(\.\d+)*)/i.test(ua)) {
    const match = ua.match(/edg\/(\d+(\.\d+)*)/i);
    return { name: 'Edge', version: match ? match[1] : '' };
  }
  if (/chrome\/(\d+(\.\d+)*)/i.test(ua) && !/edg\//i.test(ua)) {
    const match = ua.match(/chrome\/(\d+(\.\d+)*)/i);
    return { name: 'Chrome', version: match ? match[1] : '' };
  }
  if (/safari\/(\d+(\.\d+)*)/i.test(ua) && !/chrome\//i.test(ua)) {
    const match = ua.match(/version\/(\d+(\.\d+)*)/i);
    return { name: 'Safari', version: match ? match[1] : '' };
  }
  if (/opera|opr\/(\d+(\.\d+)*)/i.test(ua)) {
    const match = ua.match(/(opera|opr)\/(\d+(\.\d+)*)/i);
    return { name: 'Opera', version: match ? match[2] : '' };
  }
  return { name: 'Browser', version: 'Unknown' };
}

function detectOS(ua: string): string {
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  const ua = navigator.userAgent || '';
  if (/mobile|android.*mobile|iphone|ipod/i.test(ua) || width < 640) {
    return 'mobile';
  }
  if (/ipad|tablet|android(?!.*mobile)/i.test(ua) || (width >= 640 && width < 1024)) {
    return 'tablet';
  }
  return 'desktop';
}

// -------------------------------------------------------------
// 4. Privacy Redaction & Financial Sanitization
// -------------------------------------------------------------
export function sanitizeFinancialSnapshot(
  data?: Record<string, any>,
  redactNumbers = false
): Record<string, any> | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || val === null) {
      result[key] = null;
      continue;
    }

    if (redactNumbers) {
      if (typeof val === 'number') {
        result[key] = '[REDACTED]';
      } else if (typeof val === 'string' && /^\$?\d+([.,]\d+)?%?$/.test(val.trim())) {
        result[key] = '[REDACTED]';
      } else if (Array.isArray(val)) {
        result[key] = `[${val.length} items - REDACTED]`;
      } else if (typeof val === 'object') {
        result[key] = sanitizeFinancialSnapshot(val, true);
      } else {
        result[key] = val;
      }
    } else {
      // Normal sanitization (clean floats to 2-4 decimals, redact potential secrets)
      if (typeof val === 'number') {
        if (!Number.isFinite(val)) {
          result[key] = String(val); // 'NaN' or 'Infinity'
        } else {
          result[key] = Math.round(val * 10000) / 10000;
        }
      } else if (Array.isArray(val)) {
        // Keep first 3 items summary to avoid huge dumps
        result[key] = val.length > 5 ? `[${val.length} items: sample ${JSON.stringify(val.slice(0, 2))}]` : val;
      } else if (typeof val === 'object') {
        result[key] = sanitizeFinancialSnapshot(val, false);
      } else {
        result[key] = val;
      }
    }
  }

  return result;
}

/**
 * Automatically scrap/inspect active form fields on screen if no snapshot was manually passed
 */
export function extractActiveCalculatorInputsFromDom(): Record<string, any> | undefined {
  if (typeof document === 'undefined') return undefined;
  try {
    const container = document.querySelector('main');
    if (!container) return undefined;

    const inputs = container.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select');
    if (!inputs || inputs.length === 0) return undefined;

    const extracted: Record<string, any> = {};
    inputs.forEach((el, idx) => {
      // Skip search inputs, admin password inputs, and checkbox inputs that are internal
      if (el.type === 'password' || el.type === 'hidden' || el.name === 'q' || el.id === 'search-input') {
        return;
      }
      const label =
        el.getAttribute('aria-label') ||
        el.getAttribute('name') ||
        el.getAttribute('placeholder') ||
        el.id ||
        `param_${idx + 1}`;
      
      const val = el.value;
      if (val !== undefined && val !== '') {
        const num = parseFloat(val.replace(/[$,]/g, ''));
        extracted[label] = Number.isFinite(num) ? num : val;
      }
    });

    return Object.keys(extracted).length > 0 ? extracted : undefined;
  } catch {
    return undefined;
  }
}

// -------------------------------------------------------------
// 5. Diagnostics Collector
// -------------------------------------------------------------
export function collectDiagnostics(options?: {
  tool?: ToolDef | null;
  inputsSnapshot?: Record<string, any>;
  outputsSnapshot?: Record<string, any>;
  currencyCode?: string;
  currencySymbol?: string;
  includeSanitizedParams?: boolean;
}): SystemDiagnostics {
  const isBrowser = typeof window !== 'undefined';
  const ua = isBrowser ? navigator.userAgent : 'Node.js/Server';
  const browser = detectBrowser(ua);
  const os = detectOS(ua);
  const deviceType = detectDeviceType();

  const activeCurrency = options?.currencyCode || 'USD';
  const activeSymbol = options?.currencySymbol || '$';
  const redact = options?.includeSanitizedParams === false;

  // Inputs snapshot fallback
  let rawInputs = options?.inputsSnapshot;
  if (!rawInputs && isBrowser) {
    rawInputs = extractActiveCalculatorInputsFromDom();
  }

  const toolInfo: ToolDiagnosticInfo | undefined = options?.tool
    ? {
        id: options.tool.id,
        name: options.tool.name,
        category: options.tool.category,
        slug: TOOL_ID_TO_CANONICAL_SLUG[options.tool.id] || options.tool.id,
        canonicalUrl: `https://finance.codepackr.com/${TOOL_ID_TO_CANONICAL_SLUG[options.tool.id] || options.tool.id}`,
      }
    : undefined;

  const currentTheme: 'light' | 'dark' =
    isBrowser && document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  let formatSample = `${activeSymbol}1,234,567.89`;
  try {
    if (isBrowser) {
      formatSample = (1234567.89).toLocaleString(navigator.language || 'en-US', {
        style: 'currency',
        currency: activeCurrency,
      });
    }
  } catch {}

  return {
    ticketId: generateTicketId(),
    tool: toolInfo,
    financialContext: {
      currencyCode: activeCurrency,
      currencySymbol: activeSymbol,
      localizedFormatSample: formatSample,
      inputsSnapshot: sanitizeFinancialSnapshot(rawInputs, redact),
      outputsSnapshot: sanitizeFinancialSnapshot(options?.outputsSnapshot, redact),
      isRedacted: redact,
    },
    client: {
      browserName: browser.name,
      browserVersion: browser.version,
      userAgent: ua,
      os,
      deviceType,
      screenResolution: isBrowser && window.screen ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
      viewportDimensions: isBrowser ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
      devicePixelRatio: isBrowser ? Math.round((window.devicePixelRatio || 1) * 100) / 100 : 1,
      language: isBrowser ? navigator.language || 'en-US' : 'en-US',
      timezone: isBrowser ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC',
      hardwareConcurrency: isBrowser ? navigator.hardwareConcurrency : undefined,
      deviceMemory: isBrowser && 'deviceMemory' in navigator ? (navigator as any).deviceMemory : undefined,
    },
    app: {
      appVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      localTime: new Date().toLocaleString(),
      urlPath: isBrowser ? `${window.location.pathname}${window.location.search}` : '/',
      theme: currentTheme,
      online: isBrowser ? navigator.onLine : true,
    },
    recentErrors: getRecentErrors(),
  };
}

// -------------------------------------------------------------
// 6. Markdown Formatter for GitHub Issues, Jira, or Slack
// -------------------------------------------------------------
export const ISSUE_TYPE_LABELS: Record<IssueType, { title: string; badge: string; description: string }> = {
  calculation_error: {
    title: 'Calculation Error / Discrepancy',
    badge: '🧮 Calculation',
    description: 'Amortization mismatch, compounding discrepancy, or wrong mathematical output',
  },
  unexpected_error_nan: {
    title: 'Unexpected Error / NaN / Crash',
    badge: '💥 Crash/NaN',
    description: 'Formula returned NaN, Infinity, blank screen, or thrown exception',
  },
  ui_chart_glitch: {
    title: 'UI / Chart / Table Layout Glitch',
    badge: '🎨 UI/Display',
    description: 'Chart rendering artifact, responsive layout overflow, or broken visual table',
  },
  currency_formatting: {
    title: 'Currency / Formatting Issue',
    badge: '💱 Currency/Locale',
    description: 'Incorrect symbol, missing decimals, conversion discrepancy, or locale bug',
  },
  feature_request: {
    title: 'Feature Request / Suggestion',
    badge: '💡 Suggestion',
    description: 'Idea for new financial formula, comparison capability, or usability improvement',
  },
};

export function formatDiagnosticsMarkdown(
  diagnostics: SystemDiagnostics,
  formValues: BugReportFormValues
): string {
  const issueMeta = ISSUE_TYPE_LABELS[formValues.issueType] || { title: formValues.issueType, badge: 'Bug' };
  const toolName = diagnostics.tool ? diagnostics.tool.name : 'General Suite / Site-wide';
  const toolSlug = diagnostics.tool ? diagnostics.tool.slug : 'N/A';
  const toolUrl = diagnostics.tool ? diagnostics.tool.canonicalUrl : diagnostics.app.urlPath;

  const lines: string[] = [
    `# 🐞 Bug Report: ${formValues.summary.trim()}`,
    ``,
    `| Metadata | Details |`,
    `| :--- | :--- |`,
    `| **Ticket Reference** | \`${diagnostics.ticketId}\` |`,
    `| **Issue Type** | ${issueMeta.badge} **${issueMeta.title}** |`,
    `| **Calculator / Tool** | **${toolName}** (\`/${toolSlug}\`) |`,
    `| **Live Page URL** | ${toolUrl} |`,
    `| **Reported Timestamp** | ${diagnostics.app.timestamp} (${diagnostics.app.localTime}) |`,
    `| **Reported By** | ${formValues.reporterName ? formValues.reporterName : 'Anonymous User'} ${formValues.reporterEmail ? `(\`${formValues.reporterEmail}\`)` : ''} |`,
    ``,
    `---`,
    ``,
    `## 1. Description & Observation`,
    `${formValues.description.trim()}`,
    ``,
  ];

  if (formValues.stepsToReproduce && formValues.stepsToReproduce.trim()) {
    lines.push(
      `## 2. Steps to Reproduce`,
      `${formValues.stepsToReproduce.trim()}`,
      ``
    );
  }

  if (formValues.expectedResult || formValues.actualResult) {
    lines.push(`## 3. Expected vs. Actual Result`);
    if (formValues.expectedResult) {
      lines.push(`- **Expected:** ${formValues.expectedResult.trim()}`);
    }
    if (formValues.actualResult) {
      lines.push(`- **Actual:** ${formValues.actualResult.trim()}`);
    }
    lines.push(``);
  }

  // Financial Context
  lines.push(
    `## 4. Financial Context & Parameters`,
    `> **Privacy Protection:** ${
      diagnostics.financialContext.isRedacted
        ? 'Numerical values redacted as requested by user. Zero banking or PII credentials transmitted.'
        : 'Sanitized parameters included. Zero banking credentials or personal identification captured.'
    }`,
    ``,
    `| Financial Property | Active State |`,
    `| :--- | :--- |`,
    `| **Currency Code** | \`${diagnostics.financialContext.currencyCode}\` (${diagnostics.financialContext.currencySymbol}) |`,
    `| **Sample Number Format** | \`${diagnostics.financialContext.localizedFormatSample}\` |`,
    `| **Data Redaction Mode** | ${diagnostics.financialContext.isRedacted ? '🔒 Full Numerical Masking' : '🔓 Sanitized Diagnostic Values'} |`
  );

  if (diagnostics.financialContext.inputsSnapshot && Object.keys(diagnostics.financialContext.inputsSnapshot).length > 0) {
    lines.push(``, `### Captured Calculation Inputs`, '```json', JSON.stringify(diagnostics.financialContext.inputsSnapshot, null, 2), '```');
  }

  if (diagnostics.financialContext.outputsSnapshot && Object.keys(diagnostics.financialContext.outputsSnapshot).length > 0) {
    lines.push(``, `### Captured Calculation Outputs`, '```json', JSON.stringify(diagnostics.financialContext.outputsSnapshot, null, 2), '```');
  }

  // Technical Diagnostics
  lines.push(
    ``,
    `## 5. Technical Diagnostics & Environment`,
    `| Environment Spec | Value |`,
    `| :--- | :--- |`,
    `| **Application Version** | \`${diagnostics.app.appVersion}\` |`,
    `| **Browser** | ${diagnostics.client.browserName} ${diagnostics.client.browserVersion} |`,
    `| **Operating System** | ${diagnostics.client.os} (${diagnostics.client.deviceType}) |`,
    `| **Viewport Dimensions** | \`${diagnostics.client.viewportDimensions}\` (Screen: \`${diagnostics.client.screenResolution}\`, DPR: ${diagnostics.client.devicePixelRatio}) |`,
    `| **Language & Locale** | \`${diagnostics.client.language}\` |`,
    `| **Timezone** | \`${diagnostics.client.timezone}\` |`,
    `| **Color Theme** | \`${diagnostics.app.theme}\` |`,
    `| **Network Connectivity** | ${diagnostics.app.online ? '🟢 Online' : '🔴 Offline'} |`,
    `| **User Agent** | \`${diagnostics.client.userAgent}\` |`
  );

  if (diagnostics.client.hardwareConcurrency || diagnostics.client.deviceMemory) {
    lines.push(
      `| **Hardware Profile** | CPU Cores: ${diagnostics.client.hardwareConcurrency || 'N/A'}, RAM: ~${diagnostics.client.deviceMemory || 'N/A'} GB |`
    );
  }

  // Recent Errors
  lines.push(``, `## 6. Recorded Runtime Error Log`);
  if (diagnostics.recentErrors && diagnostics.recentErrors.length > 0) {
    diagnostics.recentErrors.forEach((err, idx) => {
      lines.push(
        `**Error #${idx + 1} (${err.timestamp}):**`,
        `\`\`\``,
        `${err.message}`,
        err.source ? `Source: ${err.source}:${err.lineno || 0}:${err.colno || 0}` : '',
        err.stack ? `Stack:\n${err.stack}` : '',
        `\`\`\``
      );
    });
  } else {
    lines.push(`_No unhandled runtime errors or unhandled promise rejections recorded._`);
  }

  lines.push(
    ``,
    `---`,
    `*Generated automatically by Codepackr Finance Diagnostic Engine. 100% Client-Side execution.*`
  );

  return lines.filter((l) => l !== undefined).join('\n');
}

// -------------------------------------------------------------
// 7. Mailto Builder & Event Dispatcher
// -------------------------------------------------------------
export function buildBugReportMailto(
  ticketId: string,
  summary: string,
  markdownBody: string,
  recipient = 'support@codepackr.com'
): string {
  const subject = `[${ticketId}] Bug Report: ${summary.trim()}`;
  // Keep mailto body within reasonable URI length limits (< 2000 chars safely for mailto protocols)
  const trimmedBody = markdownBody.length > 1800 ? `${markdownBody.substring(0, 1750)}\n\n[... truncated for mailto link - full markdown available via Copy Report]` : markdownBody;
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmedBody)}`;
}

export function openBugReportModal(detail?: BugReportModalDetail): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('codepackr:open-bug-report', { detail }));
  }
}
