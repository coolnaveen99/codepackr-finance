import React, { useState, useEffect } from 'react';
import { TOOLS } from './data/tools';
import { ToolDef, CategoryFilter } from './types';
import { Navbar } from './components/Navbar';
import { SearchModal } from './components/SearchModal';
import { HomeDashboard } from './components/HomeDashboard';
import { NotFoundView } from './components/NotFoundView';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { SitemapModal } from './components/SitemapModal';
import { ContactView } from './components/ContactView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { TrustPageView, type TrustPageKey } from './components/TrustPageView';
import { CalculatorsView } from './components/tools/CalculatorsView';
import { FinancialPlannerView } from './components/tools/FinancialPlannerView';
import { SimpleInterestCalculatorView } from './components/tools/SimpleInterestCalculatorView';
import { CagrCalculatorView } from './components/tools/CagrCalculatorView';
import { InflationCalculatorView } from './components/tools/InflationCalculatorView';
import { EmergencyFundCalculatorView } from './components/tools/EmergencyFundCalculatorView';
import { NetWorthCalculatorView } from './components/tools/NetWorthCalculatorView';
import { RoiCalculatorView } from './components/tools/RoiCalculatorView';
import { FireCalculatorView } from './components/tools/FireCalculatorView';
import { IncomeTaxCalculatorView } from './components/tools/IncomeTaxCalculatorView';
import { CtcToInHandCalculatorView } from './components/tools/CtcToInHandCalculatorView';
import { DebtToIncomeCalculatorView } from './components/tools/DebtToIncomeCalculatorView';
import { LoanPrepaymentCalculatorView } from './components/tools/LoanPrepaymentCalculatorView';
import { LoanAmortizationCalculatorView } from './components/tools/LoanAmortizationCalculatorView';
import { LumpsumCalculatorView } from './components/tools/LumpsumCalculatorView';
import { FutureValueCalculatorView } from './components/tools/FutureValueCalculatorView';
import { SavingsGoalCalculatorView } from './components/tools/SavingsGoalCalculatorView';
import { SalaryHikeCalculatorView } from './components/tools/SalaryHikeCalculatorView';
import { GratuityCalculatorView } from './components/tools/GratuityCalculatorView';
import { NpvCalculatorView } from './components/tools/NpvCalculatorView';
import { IrrCalculatorView } from './components/tools/IrrCalculatorView';
import { BreakEvenCalculatorView } from './components/tools/BreakEvenCalculatorView';
import { BusinessValuationCalculatorView } from './components/tools/BusinessValuationCalculatorView';
import { DcfCalculatorView } from './components/tools/DcfCalculatorView';
import { WaccCalculatorView } from './components/tools/WaccCalculatorView';
import { MortgageAffordabilityCalculatorView } from './components/tools/MortgageAffordabilityCalculatorView';
import { CreditCardPayoffCalculatorView } from './components/tools/CreditCardPayoffCalculatorView';
import { GstCalculatorView } from './components/tools/GstCalculatorView';
import { CapitalGainsTaxCalculatorView } from './components/tools/CapitalGainsTaxCalculatorView';
import { HraCalculatorView } from './components/tools/HraCalculatorView';
import { StartupValuationCalculatorView } from './components/tools/StartupValuationCalculatorView';
import { BurnRateCalculatorView } from './components/tools/BurnRateCalculatorView';
import { EpfCalculatorView } from './components/tools/EpfCalculatorView';
import { RentVsBuyCalculatorView } from './components/tools/RentVsBuyCalculatorView';
import { RuleOf72CalculatorView } from './components/tools/RuleOf72CalculatorView';
import { AnnuityCalculatorView } from './components/tools/AnnuityCalculatorView';
import { DividendYieldCalculatorView } from './components/tools/DividendYieldCalculatorView';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { BugReportModal } from './components/BugReportModal';
import { BugReportModalDetail } from './lib/diagnostics';
import { GlobalBanner } from './components/GlobalBanner';
import { useToolGovernance } from './lib/useToolGovernance';
import { useAdminAuth } from './lib/useAdminAuth';
import { resolveCurrentRoute, getToolPath, SpecialPage } from './lib/urls';
import { updateDocumentMetadata } from './lib/seo';
import { CurrencyProvider } from './lib/CurrencyContext';
import { safeLocalStorage } from './lib/storage';
import { NavEntry, NavigationProvider } from './lib/NavigationContext';
import { Lock } from 'lucide-react';
import { CodepackrFamilyBar } from './components/CodepackrFamilyBar';

export const App: React.FC = () => {
  // Dark mode: system preference default + localStorage (mobile premium UX §8)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = safeLocalStorage.getItem('codepackr_finance_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    safeLocalStorage.setItem('codepackr_finance_theme', theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const stored = safeLocalStorage.getItem('codepackr_finance_theme');
      if (stored !== 'light' && stored !== 'dark') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const [initialRoute] = useState(() => resolveCurrentRoute());
  const [activeTool, setActiveTool] = useState<ToolDef | null>(() => initialRoute.tool);
  const [activePage, setActivePage] = useState<SpecialPage>(() => initialRoute.page);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>(() => {
    if (initialRoute.category === 'terms') return 'terms';
    if (typeof window !== 'undefined' && window.location.pathname.includes('terms')) return 'terms';
    return 'privacy';
  });
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(() => (initialRoute.category as CategoryFilter) || 'all');
  const [navStack, setNavStack] = useState<NavEntry[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSitemapModalOpen, setIsSitemapModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [bugReportData, setBugReportData] = useState<BugReportModalDetail | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { getToolStatus, isToolVisible } = useToolGovernance();
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    const rawSlug = typeof window !== 'undefined'
      ? window.location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '')
      : '';
    let routeKey = 'home';
    if (activePage === 'contact') routeKey = 'contact';
    else if (activePage === 'privacy') routeKey = legalTab === 'terms' ? 'terms' : 'privacy';
    else if (activePage === 'notFound') routeKey = 'home';
    else if (activePage !== 'home' && activePage !== 'admin') routeKey = activePage;
    else if (rawSlug && rawSlug !== 'index') routeKey = rawSlug;
    else if (activeTool) routeKey = activeTool.id;
    updateDocumentMetadata(routeKey);
  }, [activeTool, activePage, legalTab]);

  useEffect(() => {
    const handleLocationChange = () => {
      const route = resolveCurrentRoute();
      if (route.category) setSelectedCategory(route.category as CategoryFilter);
      if (route.page === 'admin') {
        setActivePage('admin');
        setActiveTool(null);
      } else if (route.page === 'contact') {
        setActivePage('contact');
        setActiveTool(null);
      } else if (route.page === 'privacy') {
        setActivePage('privacy');
        setActiveTool(null);
        if (route.category === 'terms' || (typeof window !== 'undefined' && window.location.pathname.includes('terms'))) setLegalTab('terms');
        else setLegalTab('privacy');
      } else if (route.page === 'notFound') {
        setActiveTool(null);
        setActivePage('notFound');
      } else if (route.page !== 'home') {
        setActivePage(route.page);
        setActiveTool(null);
      } else if (route.tool) {
        setActiveTool(route.tool);
        setActivePage('home');
      } else {
        setActiveTool(null);
        setActivePage('home');
      }
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminLoginOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOpenBugReport = (e: Event) => {
      const customEvent = e as CustomEvent<BugReportModalDetail>;
      const detail = customEvent.detail;
      setBugReportData(detail || (activeTool ? { tool: activeTool } : null));
      setIsBugReportOpen(true);
    };
    window.addEventListener('codepackr:open-bug-report', handleOpenBugReport);
    return () => window.removeEventListener('codepackr:open-bug-report', handleOpenBugReport);
  }, [activeTool]);

  const getCurrentEntry = (): NavEntry => {
    if (activeTool) return { kind: 'tool', toolId: activeTool.id };
    if (activePage === 'contact') return { kind: 'page', page: 'contact' };
    if (activePage === 'privacy') return { kind: 'page', page: 'privacy', tab: legalTab };
    if (activePage === 'admin') return { kind: 'page', page: 'admin' };
    if (activePage && activePage !== 'home' && activePage !== 'notFound') return { kind: 'page', page: activePage };
    if (selectedCategory && selectedCategory !== 'all') return { kind: 'category', category: selectedCategory };
    return { kind: 'home' };
  };

  const pushToHistory = (fromEntry?: NavEntry) => {
    const current = fromEntry || getCurrentEntry();
    setNavStack((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.kind === current.kind && last.toolId === current.toolId && last.category === current.category && last.page === current.page && last.tab === current.tab) return prev;
      return [...prev.slice(-29), current];
    });
  };

  const navigateToTool = (tool: ToolDef, options?: { pushHistory?: boolean } | string) => {
    const shouldPush = typeof options === 'object' && options !== null ? options.pushHistory !== false : true;
    if (shouldPush) pushToHistory();
    setActiveTool(tool);
    setActivePage('home');
    window.history.pushState({}, '', getToolPath(tool));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = (options?: { pushHistory?: boolean } | React.MouseEvent | unknown) => {
    const shouldPush = typeof options === 'object' && options !== null && 'pushHistory' in options ? (options as { pushHistory?: boolean }).pushHistory !== false : true;
    if (shouldPush) pushToHistory();
    setActiveTool(null);
    setActivePage('home');
    setSelectedCategory('all');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToContact = (options?: { pushHistory?: boolean }) => {
    if (options?.pushHistory !== false) pushToHistory();
    setActiveTool(null);
    setActivePage('contact');
    window.history.pushState({}, '', '/contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPrivacy = (tab: 'privacy' | 'terms' = 'privacy', options?: { pushHistory?: boolean }) => {
    if (options?.pushHistory !== false) pushToHistory();
    setLegalTab(tab);
    setActiveTool(null);
    setActivePage('privacy');
    window.history.pushState({}, '', tab === 'terms' ? '/terms' : '/privacy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTrustPage = (page: TrustPageKey, options?: { pushHistory?: boolean }) => {
    if (options?.pushHistory !== false) pushToHistory();
    setActiveTool(null);
    setActivePage(page);
    window.history.pushState({}, '', `/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: CategoryFilter, options?: { pushHistory?: boolean }) => {
    if (options?.pushHistory !== false) pushToHistory();
    setSelectedCategory(cat);
    setActiveTool(null);
    setActivePage('home');
    window.history.pushState({}, '', cat !== 'all' && cat !== 'bookmarks' ? `/?cat=${cat}` : '/');
    window.setTimeout(() => {
      const catSection = document.getElementById('tool-grid');
      if (cat !== 'all' && catSection) {
        const targetY = catSection.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  const handleBack = () => {
    if (navStack.length === 0) {
      navigateToHome({ pushHistory: false });
      return;
    }
    const previous = navStack[navStack.length - 1];
    setNavStack((prev) => prev.slice(0, -1));
    if (previous.kind === 'tool' && previous.toolId) {
      const foundTool = TOOLS.find((t) => t.id === previous.toolId);
      if (foundTool) {
        setActiveTool(foundTool);
        setActivePage('home');
        window.history.pushState({}, '', getToolPath(foundTool));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else if (previous.kind === 'category' && previous.category) {
      setSelectedCategory(previous.category as CategoryFilter);
      setActiveTool(null);
      setActivePage('home');
      window.history.pushState({}, '', previous.category !== 'all' && previous.category !== 'bookmarks' ? `/?cat=${previous.category}` : '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    } else if (previous.kind === 'page' && previous.page) {
      setActiveTool(null);
      if (previous.page === 'privacy') {
        const t = previous.tab || 'privacy';
        setLegalTab(t);
        setActivePage('privacy');
        window.history.pushState({}, '', t === 'terms' ? '/terms' : '/privacy');
      } else if (previous.page === 'contact') {
        setActivePage('contact');
        window.history.pushState({}, '', '/contact');
      } else if (previous.page === 'admin') {
        setActivePage('admin');
        window.history.pushState({}, '', '/admin');
      } else {
        setActivePage(previous.page as SpecialPage);
        window.history.pushState({}, '', `/${previous.page}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigateToHome({ pushHistory: false });
  };

  const renderTool = (tool: ToolDef) => {
    const gov = getToolStatus(tool.id);
    const isHiddenTool = gov.status === 'hidden' || gov.visibility === 'admin_only';
    if (isHiddenTool && !isToolVisible(tool.id, isAuthenticated)) {
      return (
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)]"><Lock className="w-8 h-8" /></div>
          <h2 className="text-2xl font-bold text-[color:var(--ink)]">Tool Unavailable</h2>
          <p className="text-sm text-[color:var(--ink-muted)]">This calculator is currently unlisted or under review.</p>
          <button onClick={() => navigateToHome()} className="px-6 py-2.5 rounded-xl font-bold bg-[color:var(--brand)] text-white cursor-pointer">Browse Calculators</button>
        </div>
      );
    }
    const views: Record<string, React.ReactNode> = {
      'financial-planner': <FinancialPlannerView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'simple-interest-calculator': <SimpleInterestCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'cagr-calculator': <CagrCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'inflation-calculator': <InflationCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'emergency-fund-calculator': <EmergencyFundCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'net-worth-calculator': <NetWorthCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'roi-calculator': <RoiCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'fire-calculator': <FireCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'income-tax-calculator': <IncomeTaxCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'ctc-to-in-hand-calculator': <CtcToInHandCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'debt-to-income-calculator': <DebtToIncomeCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'loan-prepayment-calculator': <LoanPrepaymentCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'loan-amortization-calculator': <LoanAmortizationCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'lumpsum-calculator': <LumpsumCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'future-value-calculator': <FutureValueCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'savings-goal-calculator': <SavingsGoalCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'salary-hike-calculator': <SalaryHikeCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'gratuity-calculator': <GratuityCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'npv-calculator': <NpvCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'irr-calculator': <IrrCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'break-even-calculator': <BreakEvenCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'business-valuation-calculator': <BusinessValuationCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'dcf-calculator': <DcfCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'wacc-calculator': <WaccCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'mortgage-affordability-calculator': <MortgageAffordabilityCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'credit-card-payoff-calculator': <CreditCardPayoffCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'gst-calculator': <GstCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'capital-gains-tax-calculator': <CapitalGainsTaxCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'hra-calculator': <HraCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'startup-valuation-calculator': <StartupValuationCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'burn-rate-calculator': <BurnRateCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'epf-calculator': <EpfCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'rent-vs-buy-calculator': <RentVsBuyCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'rule-of-72-calculator': <RuleOf72CalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'annuity-calculator': <AnnuityCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
      'dividend-yield-calculator': <DividendYieldCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
    };
    const content = views[tool.id] || <CalculatorsView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />;
    return <div className="space-y-4">{content}</div>;
  };

  const navContextValue = {
    navStack,
    onBack: navStack.length > 0 ? handleBack : undefined,
    onBackToHome: navigateToHome,
    navigateToTool,
    navigateToHome,
  };

  return (
    <CurrencyProvider>
      <NavigationProvider value={navContextValue}>
        <div className="min-h-screen flex flex-col font-sans selection:bg-[color:var(--brand)] selection:text-white bg-[color:var(--bg)] text-[color:var(--ink)]">
          <CodepackrFamilyBar />
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenSearch={() => setIsSearchOpen(true)}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onGoHome={navigateToHome}
            onGoContact={navigateToContact}
            isContactActive={activePage === 'contact'}
            onGoBookmarks={() => handleSelectCategory('bookmarks')}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            isAdmin={isAuthenticated}
            onGoAdmin={() => { setActivePage('admin'); setActiveTool(null); window.history.pushState({}, '', '/admin'); }}
          />
          <GlobalBanner />
          <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => { handleSelectCategory(cat); setIsSidebarOpen(false); }}
              onGoHome={navigateToHome}
              onGoBookmarks={() => { handleSelectCategory('bookmarks'); setIsSidebarOpen(false); }}
              onGoContact={navigateToContact}
              onGoPrivacy={() => navigateToPrivacy('privacy')}
              onGoTerms={() => navigateToPrivacy('terms')}
            />
            <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 cp-mobile-main-pad cp-page">
              {activePage === 'admin' ? (
                <AdminPortal onBack={navStack.length > 0 ? handleBack : navigateToHome} />
              ) : activePage === 'contact' ? (
                <ContactView onBack={navStack.length > 0 ? handleBack : navigateToHome} />
              ) : activePage === 'privacy' ? (
                <PrivacyPolicyView onBack={navStack.length > 0 ? handleBack : navigateToHome} onContactClick={navigateToContact} initialTab={legalTab} />
              ) : activePage === 'notFound' ? (
                <NotFoundView onGoHome={navigateToHome} onOpenSearch={() => setIsSearchOpen(true)} onSelectTool={navigateToTool} />
              ) : activePage !== 'home' ? (
                <TrustPageView page={activePage as TrustPageKey} onBack={navStack.length > 0 ? handleBack : navigateToHome} />
              ) : activeTool ? (
                <div className="max-w-6xl mx-auto animate-fade-in">{renderTool(activeTool)}</div>
              ) : (
                <HomeDashboard
                  onSelectTool={navigateToTool}
                  onOpenSearch={() => setIsSearchOpen(true)}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  onGoTrustPage={navigateToTrustPage}
                />
              )}
            </main>
          </div>
          <Footer
            onGoHome={navigateToHome}
            onGoContact={navigateToContact}
            onGoPrivacy={navigateToPrivacy}
            onGoTrustPage={navigateToTrustPage}
            onOpenSitemap={() => setIsSitemapModalOpen(true)}
            onOpenBugReport={() => {
              setBugReportData(activeTool ? { tool: activeTool } : null);
              setIsBugReportOpen(true);
            }}
            onOpenAdminLogin={() => {
              if (isAuthenticated) {
                setActivePage('admin'); setActiveTool(null); window.history.pushState({}, '', '/admin');
              } else setIsAdminLoginOpen(true);
            }}
          />
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelectTool={navigateToTool} />
          <SitemapModal isOpen={isSitemapModalOpen} onClose={() => setIsSitemapModalOpen(false)} onSelectTool={navigateToTool} onNavigateAdmin={() => { setActivePage('admin'); setActiveTool(null); window.history.pushState({}, '', '/admin'); }} />
          <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onSuccess={() => { setIsAdminLoginOpen(false); setActivePage('admin'); setActiveTool(null); window.history.pushState({}, '', '/admin'); }} />
          <BugReportModal
            isOpen={isBugReportOpen}
            onClose={() => setIsBugReportOpen(false)}
            initialData={bugReportData}
          />
        </div>
      </NavigationProvider>
    </CurrencyProvider>
  );
};
