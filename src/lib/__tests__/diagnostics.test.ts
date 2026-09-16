import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateTicketId,
  recordRuntimeDiagnosticError,
  getRecentErrors,
  clearRecentErrors,
  sanitizeFinancialSnapshot,
  collectDiagnostics,
  formatDiagnosticsMarkdown,
  buildBugReportMailto,
  BugReportFormValues,
} from '../diagnostics';
import { TOOLS } from '../../data/tools';

describe('Diagnostics System & Privacy Collector', () => {
  beforeEach(() => {
    clearRecentErrors();
  });

  describe('Ticket ID Generation', () => {
    it('generates ticket IDs matching FIN-BUG-YYYYMMDD-XXXX', () => {
      const ticketId = generateTicketId();
      expect(ticketId).toMatch(/^FIN-BUG-\d{8}-[A-Z0-9]{4}$/);
    });

    it('generates unique IDs across calls', () => {
      const id1 = generateTicketId();
      const id2 = generateTicketId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('Error Buffer & Listener', () => {
    it('records runtime errors and respects the 5-item circular buffer limit', () => {
      expect(getRecentErrors()).toHaveLength(0);

      for (let i = 1; i <= 8; i++) {
        recordRuntimeDiagnosticError(`Test error ${i}`);
      }

      const errors = getRecentErrors();
      expect(errors).toHaveLength(5);
      // Most recent should be at the front
      expect(errors[0].message).toBe('Test error 8');
      expect(errors[4].message).toBe('Test error 4');
    });

    it('captures stack and location properties when available', () => {
      const dummyErr = new Error('Calculation divide-by-zero');
      recordRuntimeDiagnosticError('Divide by zero failure', dummyErr, 'calcEngine.ts', 42, 10);

      const errors = getRecentErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].source).toBe('calcEngine.ts');
      expect(errors[0].lineno).toBe(42);
      expect(errors[0].stack).toBeDefined();
    });
  });

  describe('Privacy Redaction & Sanitization', () => {
    const rawData = {
      principal: 250000,
      rate: 7.25,
      tenureYears: 20,
      monthlyPayment: 1976.43,
      schedule: [1, 2, 3, 4, 5, 6, 7],
      nested: {
        totalInterest: 224343.2,
      },
    };

    it('sanitizes and caps decimals without redacting when redactNumbers is false', () => {
      const sanitized = sanitizeFinancialSnapshot(rawData, false);
      expect(sanitized).toBeDefined();
      expect(sanitized?.principal).toBe(250000);
      expect(sanitized?.rate).toBe(7.25);
      expect(sanitized?.nested.totalInterest).toBe(224343.2);
    });

    it('masks all numbers to [REDACTED] when redactNumbers is true', () => {
      const redacted = sanitizeFinancialSnapshot(rawData, true);
      expect(redacted?.principal).toBe('[REDACTED]');
      expect(redacted?.rate).toBe('[REDACTED]');
      expect(redacted?.nested?.totalInterest).toBe('[REDACTED]');
    });

    it('handles undefined or null gracefully', () => {
      expect(sanitizeFinancialSnapshot(undefined)).toBeUndefined();
      expect(sanitizeFinancialSnapshot({ foo: null })).toEqual({ foo: null });
    });
  });

  describe('collectDiagnostics', () => {
    it('gathers technical client and environment telemetry', () => {
      const sampleTool = TOOLS[0];
      const diag = collectDiagnostics({
        tool: sampleTool,
        currencyCode: 'EUR',
        currencySymbol: '€',
        inputsSnapshot: { amount: 5000 },
        includeSanitizedParams: true,
      });

      expect(diag.ticketId).toMatch(/^FIN-BUG-/);
      expect(diag.tool?.id).toBe(sampleTool.id);
      expect(diag.tool?.name).toBe(sampleTool.name);
      expect(diag.financialContext.currencyCode).toBe('EUR');
      expect(diag.financialContext.currencySymbol).toBe('€');
      expect(diag.financialContext.isRedacted).toBe(false);
      expect(diag.financialContext.inputsSnapshot?.amount).toBe(5000);
      expect(diag.client.os).toBeDefined();
      expect(diag.client.browserName).toBeDefined();
      expect(diag.app.appVersion).toBe('1.0.0');
    });

    it('redacts financial inputs when includeSanitizedParams is false', () => {
      const diag = collectDiagnostics({
        currencyCode: 'USD',
        inputsSnapshot: { principal: 100000 },
        includeSanitizedParams: false,
      });

      expect(diag.financialContext.isRedacted).toBe(true);
      expect(diag.financialContext.inputsSnapshot?.principal).toBe('[REDACTED]');
    });
  });

  describe('formatDiagnosticsMarkdown', () => {
    it('produces structured markdown with ticket ID, issue metadata, and environment tables', () => {
      const sampleTool = TOOLS[1];
      const diag = collectDiagnostics({
        tool: sampleTool,
        inputsSnapshot: { principal: 10000, rate: 8 },
        includeSanitizedParams: true,
      });

      const formValues: BugReportFormValues = {
        ticketId: diag.ticketId,
        issueType: 'calculation_error',
        summary: 'Interest differs by 0.5% in compound formula',
        description: 'Expected monthly compounding to yield $10,832 but showed $10,800.',
        stepsToReproduce: '1. Enter 10000\n2. Set 8% annual\n3. Select monthly',
        expectedResult: '$10,832.89',
        actualResult: '$10,800.00',
        reporterName: 'Alex Rivera',
        reporterEmail: 'alex@example.com',
        includeSanitizedParams: true,
      };

      const md = formatDiagnosticsMarkdown(diag, formValues);
      expect(md).toContain(`# 🐞 Bug Report: Interest differs by 0.5% in compound formula`);
      expect(md).toContain(diag.ticketId);
      expect(md).toContain(`**${sampleTool.name}**`);
      expect(md).toContain('## 1. Description & Observation');
      expect(md).toContain('## 2. Steps to Reproduce');
      expect(md).toContain('## 3. Expected vs. Actual Result');
      expect(md).toContain('## 4. Financial Context & Parameters');
      expect(md).toContain('## 5. Technical Diagnostics & Environment');
      expect(md).toContain('Alex Rivera (`alex@example.com`)');
    });
  });

  describe('buildBugReportMailto', () => {
    it('generates a valid mailto URI with encoded ticket ID and body', () => {
      const mailto = buildBugReportMailto('FIN-BUG-20260916-1234', 'Calculation NaN error', 'Test body contents');
      expect(mailto).toMatch(/^mailto:support@codepackr\.com\?subject=/);
      expect(mailto).toContain(encodeURIComponent('[FIN-BUG-20260916-1234] Bug Report: Calculation NaN error'));
      expect(mailto).toContain(encodeURIComponent('Test body contents'));
    });
  });
});
