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
import { TermInsuranceCalculatorView } from './components/tools/TermInsuranceCalculatorView';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { GlobalBanner } from './components/GlobalBanner';
import { BugReportModal, type BugReportModalDetail } from './components/BugReportModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileNavBridge } from './components/MobileNavBridge';
import { useToolGovernance } from './lib/toolGovernance';
import { useAdminAuth } from './lib/adminAuth';
import { resolveCurrentRoute, SpecialPage, getToolPath } from './lib/urls';
import { updateDocumentMetadata } from './lib/seo';
import { CurrencyProvider } from './lib/CurrencyContext';
import { safeLocalStorage } from './lib/storage';
import { NavEntry, NavigationProvider } from './lib/NavigationContext';
import { Lock } from 'lucide-react';
import { CodepackrFamilyBar } from './components/CodepackrFamilyBar';

export const App: React.FC = () => {
  // Dark mode deferred — light theme only (MOBILE_PREMIUM_UX §1B).
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try {
      const stored = safeLocalStorage.getItem('codepackr_finance_theme');
      if (stored === 'dark') safeLocalStorage.setItem('codepackr_finance_theme', 'light');
    } catch { /* ignore */ }
  }, []);

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
      } else if (route.page !== 'home' && route.page !== 'notFound') {
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
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const pushToHistory = (entry: NavEntry) => {
    setNavStack((prev) => [...prev, entry]);
  };

  const navigateToHome = (opts?: { pushHistory?: boolean; category?: CategoryFilter }) => {
    if (opts?.pushHistory !== false && (activeTool || activePage !== 'home')) {
      pushToHistory({
        kind: activeTool ? 'tool' : 'page',
        toolId: activeTool?.id,
        page: activePage !== 'home' ? activePage : undefined,
      });
    }
    setActiveTool(null);
    setActivePage('home');
    if (opts?.category) setSelectedCategory(opts.category);
    window.history.pushState({}, '', opts?.category && opts.category !== 'all' ? `/${opts.category}` : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTool = (tool: ToolDef) => {
    if (activeTool?.id !== tool.id) {
      pushToHistory({
        kind: activeTool ? 'tool' : 'page',
        toolId: activeTool?.id,
        page: activePage !== 'home' ? activePage : undefined,
      });
    }
    setActiveTool(tool);
    setActivePage('home');
    window.history.pushState({}, '', getToolPath(tool));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToContact = () => {
    pushToHistory({
      kind: activeTool ? 'tool' : 'page',
      toolId: activeTool?.id,
      page: activePage !== 'home' ? activePage : undefined,
    });
    setActivePage('contact');
    setActiveTool(null);
    window.history.pushState({}, '', '/contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    if (activeTool || activePage !== 'home') {
      navigateToHome({ pushHistory: true, category: cat });
    } else {
      window.history.pushState({}, '', cat === 'all' ? '/' : `/${cat}`);
    }
  };

  const handleBack = () => {
    if (navStack.length > 0) {
      const previous = navStack[navStack.length - 1];
      setNavStack((prev) => prev.slice(0, -1));
      if (previous.kind === 'tool' && previous.toolId) {
        const tool = TOOLS.find((t) => t.id === previous.toolId);
        if (tool) {
          setActiveTool(tool);
          setActivePage('home');
          window.history.pushState({}, '', getToolPath(tool));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else if (previous.page === 'contact') {
        setActivePage('contact');
        setActiveTool(null);
        window.history.pushState({}, '', '/contact');
      } else if (previous.page === 'admin') {
        setActivePage('admin');
        setActiveTool(null);
        window.history.pushState({}, '', '/admin');
      } else if (previous.page && previous.page !== 'home') {
        setActivePage(previous.page as SpecialPage);
        setActiveTool(null);
        window.history.pushState({}, '', `/${previous.page}`);
      } else {
        setActivePage('home');
        setActiveTool(null);
        window.history.pushState({}, '', '/');
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
      'term-insurance-calculator': <TermInsuranceCalculatorView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />,
    };
    return views[tool.id] || <CalculatorsView tool={tool} onBackToHome={navigateToHome} onSelectRelated={navigateToTool} />;
  };

  return (
    <CurrencyProvider>
      <NavigationProvider value={{ push: pushToHistory, back: handleBack, stack: navStack }}>
        <div className="min-h-screen flex flex-col font-sans bg-[color:var(--bg)] text-[color:var(--ink)]">
          <CodepackrFamilyBar />
          <Navbar
            onOpenSearch={() => setIsSearchOpen(true)}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onGoHome={navigateToHome}
            onGoContact={navigateToContact}
            onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
            isAdmin={isAuthenticated}
            onGoAdmin={() => { setActivePage('admin'); setActiveTool(null); window.history.pushState({}, '', '/admin'); }}
            onOpenBugReport={() => setIsBugReportOpen(true)}
          />
          <GlobalBanner />
          <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed((p) => !p)}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onSelectTool={navigateToTool}
              onGoHome={navigateToHome}
            />
            <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 cp-mobile-main-pad cp-page">
              {activePage === 'admin' ? (
                <AdminPortal onBack={handleBack} />
              ) : activePage === 'contact' ? (
                <ContactView onBack={handleBack} />
              ) : activePage === 'privacy' ? (
                <PrivacyPolicyView activeTab={legalTab} onTabChange={setLegalTab} onBack={handleBack} />
              ) : activePage !== 'home' && activePage !== 'notFound' ? (
                <TrustPageView page={activePage as TrustPageKey} onBack={handleBack} />
              ) : activeTool ? (
                renderTool(activeTool)
              ) : activePage === 'notFound' ? (
                <NotFoundView onGoHome={navigateToHome} />
              ) : (
                <HomeDashboard
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  onSelectTool={navigateToTool}
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
              )}
            </main>
          </div>
          <Footer
            onGoContact={navigateToContact}
            onOpenSitemap={() => setIsSitemapModalOpen(true)}
            onGoHome={navigateToHome}
          />
          <MobileBottomNav
            onOpenSearch={() => setIsSearchOpen(true)}
            onGoHome={navigateToHome}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
          <MobileNavBridge />
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelectTool={navigateToTool} />
          <SitemapModal isOpen={isSitemapModalOpen} onClose={() => setIsSitemapModalOpen(false)} onSelectTool={navigateToTool} onSelectCategory={handleSelectCategory} />
          <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} />
          <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} detail={bugReportData} tool={activeTool} />
        </div>
      </NavigationProvider>
    </CurrencyProvider>
  );
};
