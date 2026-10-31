import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Respiro } from './components/Respiro';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { Preloader } from './components/Preloader';
import { smoothScrollToTarget } from './utils/scroll';

const MenuSection = lazy(() =>
  import('./components/MenuSection').then((m) => ({ default: m.MenuSection }))
);
const Gallery = lazy(() =>
  import('./components/Gallery').then((m) => ({ default: m.Gallery }))
);
const Units = lazy(() =>
  import('./components/Units').then((m) => ({ default: m.Units }))
);
const Franchise = lazy(() =>
  import('./components/Franchise').then((m) => ({ default: m.Franchise }))
);
const Contact = lazy(() =>
  import('./components/Contact').then((m) => ({ default: m.Contact }))
);

const FranchisePage = lazy(() =>
  import('./components/FranchisePage').then((m) => ({ default: m.FranchisePage }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#001219] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#EE9B00]/30 border-t-[#EE9B00] rounded-full animate-spin" />
        <span className="text-sm font-sans tracking-widest uppercase text-[#94D2BD]/80">
          Carregando...
        </span>
      </div>
    </div>
  );
}

type Route = 'home' | 'franchise' | 'admin';

function getInitialRoute(): Route {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.includes('/franquia') || hash === '#franquia') return 'franchise';
  if (path.includes('/admin') || hash === '#admin') return 'admin';
  return 'home';
}

export function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>(getInitialRoute);
  const [showPreloader, setShowPreloader] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    // Show preloader only on initial visit per session
    const hasLoaded = sessionStorage.getItem('el_chicano_preloaded');
    return !hasLoaded;
  });

  const navigateTo = (route: Route, pushHistory = true) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pushHistory && typeof window !== 'undefined') {
      const targetPath = route === 'home' ? '/' : `/${route}`;
      window.history.pushState({ route }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (href: string) => {
    if (href === '/admin' || href === '#admin') {
      navigateTo('admin');
      return;
    }
    if (href === '/franquia' || href === '#franquia') {
      navigateTo('franchise');
      return;
    }
    if (href.startsWith('#')) {
      if (currentRoute !== 'home') {
        navigateTo('home');
        setTimeout(() => smoothScrollToTarget(href), 100);
      } else {
        smoothScrollToTarget(href);
      }
    }
  };

  const handlePreloaderFinish = () => {
    setShowPreloader(false);
    sessionStorage.setItem('el_chicano_preloaded', 'true');
  };

  // Route 1: Dedicated High-Conversion Franchise Landing Page
  if (currentRoute === 'franchise') {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <FranchisePage onBackToHome={() => navigateTo('home')} />
      </Suspense>
    );
  }

  // Route 2: Admin Dashboard (Leads Management & Instagram Slots)
  if (currentRoute === 'admin') {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <AdminDashboard onBackToHome={() => navigateTo('home')} />
      </Suspense>
    );
  }

  // Route 3: Main Restaurant Landing Page
  return (
    <div className="relative min-h-screen bg-[#001219] text-[#E9D8A6] selection:bg-[#EE9B00] selection:text-[#001219] overflow-x-clip">
      {/* Atmospheric Preloader */}
      {showPreloader && <Preloader onFinish={handlePreloaderFinish} />}

      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#EE9B00] focus:text-[#001219] focus:font-bold focus:rounded-xl focus:shadow-[4px_4px_0px_#000] focus:border-2 focus:border-[#001219] focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      {/* Main Floating Navigation Header */}
      <Header onNavigate={handleNavigate} />

      {/* Main Semantic Content Landmark */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero Section */}
        <Hero onNavigate={handleNavigate} />

        {/* About Section (Nossa História & Video Player) */}
        <About />

        {/* Menu & Products Section */}
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <MenuSection />
        </Suspense>

        {/* Respiro Callout Section */}
        <Respiro onNavigate={handleNavigate} />

        <Suspense fallback={<div className="min-h-[300px]" />}>
          {/* Gallery & Lightbox Section */}
          <Gallery />

          {/* Nossas Casas / Units Section */}
          <Units />

          {/* Franchise Section (With Quero Começar CTA) */}
          <Franchise onNavigateToFranchise={() => navigateTo('franchise')} />

          {/* Contact Section */}
          <Contact />
        </Suspense>
      </main>

      {/* Complete Footer with subtle Admin access */}
      <Footer onNavigate={handleNavigate} />

      {/* Fixed Side Actions (WhatsApp, Cardápio, Top) */}
      <FloatingActions />
    </div>
  );
}

export default App;
