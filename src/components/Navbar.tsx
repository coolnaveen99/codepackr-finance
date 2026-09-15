import React from 'react';
import { Search, Moon, Sun, Star, Menu, Shield, Mail, Terminal } from 'lucide-react';
import { CategoryFilter } from '../types';
import { useBookmarks } from '../lib/bookmarks';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  selectedCategory?: CategoryFilter;
  onSelectCategory?: (cat: CategoryFilter) => void;
  onGoHome: () => void;
  onGoContact: () => void;
  isContactActive?: boolean;
  onGoBookmarks?: () => void;
  onToggleSidebar?: () => void;
  isAdmin?: boolean;
  onGoAdmin?: () => void;
}

/** Simple chart bars icon for the Finance brand badge (matches favicon family). */
const FinanceBadgeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect x="3" y="14" width="4" height="7" rx="1" />
    <rect x="10" y="9" width="4" height="12" rx="1" />
    <rect x="17" y="4" width="4" height="17" rx="1" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenSearch,
  selectedCategory = 'all',
  onSelectCategory,
  onGoHome,
  onGoContact,
  isContactActive = false,
  onGoBookmarks,
  onToggleSidebar,
  isAdmin = false,
  onGoAdmin,
}) => {
  const darkMode = theme === 'dark';
  const { count: bookmarkCount } = useBookmarks();
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.userAgent.includes('Mac'));
    }
  }, []);

  const handleSelectBookmarks = () => {
    if (onGoBookmarks) {
      onGoBookmarks();
    } else if (onSelectCategory) {
      onSelectCategory('bookmarks');
    }
  };

  // Shared styles WITHOUT display utilities (avoid Tailwind conflict)
  const devPillBase =
    'items-center gap-1.5 rounded-full text-xs font-semibold border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all shrink-0 shadow-xs cursor-pointer group';

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors border-[color:var(--border)] bg-[color:var(--surface)]/85">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3 min-w-0">

          {/* Left: Menu + Brand + Dev Suite link */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {onToggleSidebar && (
              <button
                id="sidebar-toggle-btn"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl border border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)] transition-colors cursor-pointer shrink-0"
                aria-label="Toggle navigation sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Enterprise-style brand: badge + CodePackr + FINANCE (same pattern as codepackr.com) */}
            <a
              href="/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onGoHome();
                }
              }}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none min-w-0 shrink"
              aria-label="CodePackr Finance home"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-[color:var(--brand)] transition-transform group-hover:scale-105 shrink-0">
                <FinanceBadgeIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base sm:text-lg leading-tight tracking-tight text-[color:var(--ink)] truncate">
                  CodePackr
                </span>
                <span className="hidden sm:block text-[10px] font-mono font-medium tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                  Finance
                </span>
              </div>
            </a>

            {/* Single Dev Suite cross-link — short on mobile, full on sm+ */}
            <a
              id="nav-codepackr-dev-link"
              href="https://www.codepackr.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Codepackr Developer Suite"
              aria-label="Open Codepackr Developer Suite"
              className={`inline-flex ${devPillBase} px-2.5 sm:px-3 py-1.5`}
            >
              <Terminal className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Dev Suite</span>
              <span className="hidden sm:inline">Codepackr Dev Suite</span>
            </a>
          </div>

          {/* Center search — desktop only */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block min-w-0">
            <button
              id="search-trigger-btn"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-4 py-2 text-sm rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)] hover:border-[color:var(--brand)] focus:outline-none transition-all shadow-sm cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Search className="w-4 h-4 group-hover:text-[color:var(--brand)] transition-colors shrink-0" />
                <span className="truncate">Search financial calculators...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-medium rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink-muted)] shrink-0">
                <span className="text-[10px]">{isMac ? '⌘' : 'Ctrl'}</span>K
              </kbd>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-xl border border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)] transition-colors cursor-pointer"
              aria-label="Search financial calculators"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              id="nav-bookmarks-btn"
              onClick={handleSelectBookmarks}
              className={`px-2 sm:px-3 py-1.5 text-sm font-medium rounded-xl border transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm ${
                selectedCategory === 'bookmarks'
                  ? 'bg-[color:var(--warning)] text-white border-[color:var(--warning)]'
                  : 'bg-[color:var(--surface)] border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:border-[color:var(--border-hover)]'
              }`}
              title="Saved Calculators"
            >
              <Star className={`w-4 h-4 ${selectedCategory === 'bookmarks' ? 'fill-white' : bookmarkCount > 0 ? 'text-[color:var(--warning)] fill-[color:var(--warning)]' : ''}`} />
              <span className="hidden lg:inline">Favorites</span>
              {bookmarkCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${selectedCategory === 'bookmarks' ? 'bg-white/20' : 'bg-[color:var(--surface-elevated)] text-[color:var(--ink)]'}`}>
                  {bookmarkCount}
                </span>
              )}
            </button>

            <a
              href="/contact"
              id="nav-contact-btn"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onGoContact();
                }
              }}
              className={`hidden sm:flex px-3 py-1.5 text-sm font-medium rounded-xl border transition-all items-center gap-2 cursor-pointer shadow-sm ${
                isContactActive
                  ? 'bg-[color:var(--brand)] text-white border-[color:var(--brand)]'
                  : 'bg-[color:var(--surface)] border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:border-[color:var(--border-hover)]'
              }`}
              title="Contact & Feedback"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden md:inline">Contact</span>
            </a>

            {isAdmin && onGoAdmin && (
              <button
                id="nav-admin-btn"
                onClick={onGoAdmin}
                className="hidden sm:flex px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs"
                title="Admin Console"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Admin Console</span>
              </button>
            )}

            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)] transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
