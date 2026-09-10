import React from 'react';
import { Search, Moon, Sun, Star, Menu, Shield, Mail } from 'lucide-react';
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

  // Aspect-ratio responsive logos:
  // - Web Browser / Desktop (>= 640px): Full horizontal banner logo (3.3:1 aspect ratio)
  // - Android Phone / Mobile (< 640px): Square app icon badge (1:1 aspect ratio) so it does NOT shrink into micro-text
  const desktopLogoSrc = darkMode
    ? '/codepackr-finance-logo-dark.svg'
    : '/codepackr-finance-logo.svg';

  const mobileIconSrc = darkMode
    ? '/codepackr-finance-icon-dark.svg'
    : '/codepackr-finance-icon.svg';

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors border-[color:var(--border)] bg-[color:var(--surface)]/85">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Left: Sidebar Toggle & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {onToggleSidebar && (
              <button
                id="sidebar-toggle-btn"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl border border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)] transition-colors cursor-pointer"
                aria-label="Toggle navigation sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <a
              href="/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onGoHome();
                }
              }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer focus:outline-none rounded-xl transition-opacity hover:opacity-90 shrink-0"
              aria-label="CodePackr Finance home"
            >
              <picture className="flex items-center shrink-0">
                {/* Mobile devices & Android phones (< 640px): Pick square 1:1 app icon badge */}
                <source media="(max-width: 639px)" srcSet={mobileIconSrc} />
                {/* Desktop & Web browsers (>= 640px): Pick full horizontal banner */}
                <source media="(min-width: 640px)" srcSet={desktopLogoSrc} />
                <img
                  src={desktopLogoSrc}
                  alt="CodePackr Finance — Calculate, Plan, Grow"
                  className="h-10 w-10 sm:h-11 sm:w-auto object-contain"
                  width="1274"
                  height="384"
                />
              </picture>

              {/* On mobile screens (<640px), show clean readable brand typography alongside the square app icon */}
              <div className="flex flex-col sm:hidden justify-center min-w-0">
                <span className="font-extrabold text-base leading-none tracking-tight text-[color:var(--ink)]">
                  Code<span className="text-[#0797ED] dark:text-[#4DB8FF]">packr</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#14B83D] dark:text-[#48D95B] uppercase leading-none mt-1">
                  FINANCE
                </span>
              </div>
            </a>
          </div>

          {/* Center: Command Palette Trigger */}
          <div className="flex-1 max-w-xl mx-2 hidden sm:block">
            <button
              id="search-trigger-btn"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-4 py-2 text-sm rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)] hover:border-[color:var(--brand)] focus:outline-none transition-all shadow-sm cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Search className="w-4 h-4 group-hover:text-[color:var(--brand)] transition-colors shrink-0" />
                <span className="truncate">Search financial calculators...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-medium rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink-muted)] shrink-0">
                <span className="text-[10px]">{isMac ? '⌘' : 'Ctrl'}</span>K
              </kbd>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 rounded-xl border border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)] transition-colors cursor-pointer"
              aria-label="Search financial calculators"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bookmarks */}
            <button
              id="nav-bookmarks-btn"
              onClick={handleSelectBookmarks}
              className={`px-3 py-1.5 text-sm font-medium rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                selectedCategory === 'bookmarks'
                  ? 'bg-[color:var(--warning)] text-white border-[color:var(--warning)]'
                  : 'bg-[color:var(--surface)] border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:border-[color:var(--border-hover)]'
              }`}
              title="Saved Tools"
            >
              <Star className={`w-4 h-4 ${selectedCategory === 'bookmarks' ? 'fill-white' : bookmarkCount > 0 ? 'text-[color:var(--warning)] fill-[color:var(--warning)]' : ''}`} />
              <span className="hidden md:inline">Favorites</span>
              {bookmarkCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${selectedCategory === 'bookmarks' ? 'bg-white/20' : 'bg-[color:var(--surface-elevated)] text-[color:var(--ink)]'}`}>
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* Contact */}
            <a
              href="/contact"
              id="nav-contact-btn"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onGoContact();
                }
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
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
                className="flex px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs"
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
