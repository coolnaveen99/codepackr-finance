# Privacy-First Bug Reporting & Technical Diagnostics

CodePackr Finance features a 100% client-side Bug Reporting & Technical Diagnostics subsystem that captures reproduction metadata, execution errors, and device telemetry while strictly maintaining user financial privacy.

---

## Architecture Overview

```
                      +-----------------------------------+
                      |   Active Financial Calculator    |
                      | (Inputs, Outputs, Currency Context)|
                      +-----------------+-----------------+
                                        |
+--------------------------+            |            +-------------------------+
| In-Memory Error Buffer   |            |            | Client Device Telemetry |
| (Last 5 runtime errors,  |            |            | (Browser, OS, Viewport, |
|  unhandled rejections)   |            |            |  DPR, Timezone, Online) |
+------------+-------------+            |            +------------+------------+
             |                          |                         |
             +--------------------------+-------------------------+
                                        |
                                        v
                    +---------------------------------------+
                    |  Diagnostics Collector Engine        |
                    |       (src/lib/diagnostics.ts)        |
                    +-------------------+-------------------+
                                        |
                      [User Privacy Toggle: Mask / Sanitize]
                                        |
                                        v
                    +---------------------------------------+
                    |   Bug Report Modal & Submission       |
                    |   (src/components/BugReportModal.tsx) |
                    +-------------------+-------------------+
                                        |
                 +----------------------+----------------------+
                 |                      |                      |
                 v                      v                      v
        [Submit Report]          [Copy Markdown]        [Send via Email]
       Dual dispatch API        GitHub / Slack ready    Pre-filled mailto
      (FIN-BUG-YYYYMMDD-XXXX)   Structured issue doc     Support fallback
```

---

## Core Capabilities

### 1. Zero Financial Data Exfiltration
- **Strict Privacy**: The engine never requests or records banking credentials, account numbers, passwords, or PII.
- **Toggleable Numerical Redaction**: Users have explicit control via the *"Include sanitized calculation parameters in diagnostic report"* toggle. When unchecked, all numerical inputs and currency amounts are automatically masked as `[REDACTED]`.
- **Sanitized Decimal Truncation**: When enabled, floating point values are rounded to 4 decimal places to prevent leaking high-precision personal numbers.

### 2. Automatic Error Listener
- A circular in-memory buffer records up to 5 recent runtime exceptions and `window.unhandledrejection` events.
- Stacks are truncated to the first 4 frames to keep reports compact, readable, and free of sensitive environment paths.

### 3. Ticket ID Standardization
- Every issue generates a standardized, collision-resistant ticket reference:
  `FIN-BUG-YYYYMMDD-XXXX` (e.g., `FIN-BUG-20260916-8FA2`).
- Saved locally to `localStorage.getItem('codepackr_reported_issues')` for user auditability and reference.

### 4. Triple-Action Submission Flow
1. **Direct Transmission**: Dispatches payload via Google Apps Script endpoint / webhook using dual-dispatch (fetch + hidden iframe fallback) for 100% ad-blocker and browser compatibility.
2. **One-Click Markdown Copy**: Instant clipboard copy formatted with GitHub issue headers, tables, and code blocks for sharing in GitHub Issues, Discord, or Jira.
3. **Email Client Fallback**: Direct `mailto:support@codepackr.com` link pre-populated with the ticket reference in the subject and markdown telemetry in the body.

---

## Integration Reference

- **Calculator Header**: Every calculator displays a `Report Issue` button with a `Bug` icon in `ToolHeader.tsx`.
- **Global Footer**: Every page contains a `Report a Bug` link in `Footer.tsx` for reporting site-wide or navigational glitches.
- **Programmatic Dispatch**: Any component or error boundary can trigger the modal at any time:
  ```ts
  import { openBugReportModal } from './lib/diagnostics';

  openBugReportModal({
    tool: activeTool,
    inputsSnapshot: { principal: 500000, rate: 7.5 },
    issueType: 'calculation_error',
    initialSummary: 'Interest rounding mismatch',
  });
  ```
