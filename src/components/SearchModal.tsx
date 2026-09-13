import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight, CornerDownLeft, EyeOff } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolDef } from '../types';
import { useToolGovernance } from '../lib/useToolGovernance';
import { useAdminAuth } from '../lib/useAdminAuth';
import { getIcon } from '../lib/icons';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolDef) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectTool }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isToolVisible, getToolStatus } = useToolGovernance();
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredTools = TOOLS.filter((tool) => {
    if (!isToolVisible(tool.id, isAuthenticated)) return false;
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }).slice(0, 20);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredTools.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
      e.preventDefault();
      onSelectTool(filteredTools[selectedIndex]);
      onClose();
    }
  };

  // Extract any clean number from query (e.g. 50000, $100k, 1,00,000)
  const numericMatch = useMemo(() => {
    const cleaned = query.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    return !isNaN(num) && num > 0 ? num : null;
  }, [query]);

  const quickSuggestions = [
    { label: 'Home Loan EMI', query: 'loan' },
    { label: 'SIP Wealth', query: 'sip' },
    { label: 'Retirement Planner', query: 'retirement' },
    { label: 'CTC Take-Home', query: 'salary' },
    { label: 'Compound Interest', query: 'compound' },
    { label: 'Emergency Fund', query: 'emergency' },
  ];

  if (!isOpen) return null;

  return (
    <div id="search-modal-backdrop" className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="presentation">
      <div
        id="search-modal-container"
        className="w-full max-w-2xl rounded-2xl border border-[color:var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[75vh] bg-[color:var(--surface)] transition-all duration-300 ring-1 ring-emerald-500/30"
        role="dialog"
        aria-modal="true"
        aria-label="Search financial calculators"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-[color:var(--border)] gap-3 bg-[color:var(--surface-elevated)] transition-all">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            id="search-modal-input"
            ref={inputRef}
            type="text"
            placeholder="Search financial calculators or paste an amount (e.g., $50,000)..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)]"
            aria-label="Search calculators"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface)] cursor-pointer" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:block text-xs font-mono px-2 py-1 rounded-md border border-[color:var(--border)] text-[color:var(--ink-muted)] bg-[color:var(--surface)] shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Smart Number Detection Pill */}
        {numericMatch && (
          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between gap-2 text-xs">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">
              💡 Value detected: <strong>{numericMatch.toLocaleString()}</strong> — Instant projection in:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const sip = TOOLS.find(t => t.id === 'sip-calculator');
                  if (sip) { onSelectTool(sip); onClose(); }
                }}
                className="px-2 py-0.5 rounded font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition-colors"
              >
                SIP Growth →
              </button>
              <button
                type="button"
                onClick={() => {
                  const loan = TOOLS.find(t => t.id === 'loan-calculator');
                  if (loan) { onSelectTool(loan); onClose(); }
                }}
                className="px-2 py-0.5 rounded font-bold bg-[color:var(--surface)] border border-emerald-500/30 text-[color:var(--ink)] hover:border-emerald-500 cursor-pointer transition-colors"
              >
                Loan EMI →
              </button>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        {!query && (
          <div className="px-4 py-2.5 bg-[color:var(--surface)] border-b border-[color:var(--border)] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-[color:var(--ink-muted)] uppercase tracking-wider shrink-0 mr-1">Popular:</span>
            {quickSuggestions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setQuery(item.query)}
                className="px-2.5 py-1 rounded-full bg-[color:var(--surface-elevated)] border border-[color:var(--border)] text-[color:var(--ink)] hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap transition-colors cursor-pointer text-xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar" role="listbox" aria-label="Search results">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-sm text-[color:var(--ink-muted)]" role="status">
              <p className="font-medium text-[color:var(--ink)] mb-1">No calculators found</p>
              <p>No tools matching &quot;{query}&quot;. Try a different keyword.</p>
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onSelectTool(tool); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-[color:var(--brand-light)] border border-[color:var(--brand)]' : 'border border-transparent hover:bg-[color:var(--surface-elevated)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center shrink-0 shadow-xs">
                      {getIcon(tool.icon, 20)}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold text-base ${isSelected ? 'text-[color:var(--brand)]' : 'text-[color:var(--ink)]'}`}>
                          {tool.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[color:var(--surface-muted)] text-[color:var(--ink-muted)]">
                          {tool.category}
                        </span>
                        {getToolStatus(tool.id).status === 'hidden' && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[color:var(--warning)]/10 text-[color:var(--warning)] border border-[color:var(--warning)]/30 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-[color:var(--ink-muted)] line-clamp-1">
                        {tool.description}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${isSelected ? 'text-[color:var(--brand)]' : 'text-[color:var(--ink-muted)]'}`}>
                    {isSelected && <CornerDownLeft className="w-4 h-4" />}
                    <ArrowRight className="w-5 h-5 opacity-50" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
